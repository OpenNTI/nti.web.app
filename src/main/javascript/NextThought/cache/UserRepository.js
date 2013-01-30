Ext.define('NextThought.cache.UserRepository', {
	alias: 'UserRepository',
	singleton: true,
	requires: [
		'NextThought.util.Parsing'
	],

	constructor: function() {
		Ext.apply(this,{
			store: null,
			activeRequests: {}
		});
	},


	getStore: function() {
		if(!this.store){
			this.store = Ext.data.Store.create({model: 'NextThought.model.User'});
		}
		return this.store;
	},


	updateUser: function(refreshedUser) {
		var s = this.getStore(),
			uid = refreshedUser.getId(),
			u = s.getById(uid); //user from the store

		//if the store had the user
		// AND it was not equal to the refreshedUser (the user resolved from the server)
		if (u && !u.equal(refreshedUser)) {
			//If we have a current user, and the user from the store is that user (compared by ID)
			if ($AppConfig.userObject && isMe(u) ){
				//If the INSTANCE of the user from the store does not match the instance of the current user object
				if(u !== $AppConfig.userObject) {
					//this is strange...why do we get here?
					console.warn('AppConfig user instance is different');
					//if the user in the store is not the same object as our global reference, then we need to make sure
					// that we fire changed event just incase someone is listening to it.
					$AppConfig.userObject.fireEvent('changed', refreshedUser);
				}

				$AppConfig.userObject = refreshedUser;
			}

			u.fireEvent('changed', refreshedUser);
			s.remove(u);
			u=null;
		}

		if(!u){
			s.add(refreshedUser);
		}
	},

	resolveFromStore: function(key){
		var s = this.getStore();
		return s.getById(key) || s.findRecord('Username', key, 0, false, true, true) || s.findRecord('NTIID',key,0,false,true,true);
	},

	getUser: function(username, callback, scope) {
		if (!Ext.isArray(username)) {
			username = [username];
			username.returnSingle = true;
		}

		var s = this.getStore(),
			result = [],
			l = username.length,
			async = false;

		function finish() {
			if(username.returnSingle){
				result = result[0];
			}
			Ext.callback(callback,scope, [result]);
		}

		Ext.each(
			username,
			function(o){

				var name,
					r;

				if(typeof(o) === 'string') {
					name = o;
				}
				else if(o.getId !== undefined){
					if(o.get('status') === 'Unresolved'){
						result.push(o);
						return;
					}
					name = o.getId();
				}
				else {
					//JSON representation of User
					r = ParseUtils.parseItems(o)[0];
					if(!r || !r.getModelName){
						Ext.Error.raise({message: 'Unknown result', object: r});
					}
					name = r.getId();
				}

				r = this.resolveFromStore(name);
				if (r && r.raw){
					result.push(r);
					return;
				}

				//must make a request, finish in callback so set async flag
				async = true;
				this.makeRequest(name, {
					scope: this,
					failure: function(){
						result.push(User.getUnresolved(name));
						if (result.length === l) {
							finish();
						}
					},
					success: function(u){
						//not necessary since the user model calls update
						//except that it only happens for users, we want to cache
						//groups here also
						if(!this.resolveFromStore(name)){
							s.add(u);
						}
						result.push(u);

						//our list of results is as expected, finish
						if (result.length === l) {
							finish();
						}
					}
				});
			},
			this);

		if (!async) {
			finish();//we finish linerally, everything is in the store already
		}

	},


	/**
	 * Once called, if the user is not in the cache, a placeholder object will be injected. If something requests that
	 * user while its still resolving, the record will not have a 'raw' property and it will have 'placeholder' set true
	 * in the 'data' property.
	 *
	 * @param username
	 * @param callbacks
	 */
	makeRequest: function(username, callbacks) {
		var me = this,
			result = null,
			url = $AppConfig.service.getResolveUserURL(username),
			options;

		if(!username){
			console.error('no user to look up');
			return null;
		}

		function callback(o,success,r) {

			delete me.activeRequests[username];

			if(!success){
				console.warn('There was an error resolving user:', username, arguments);
				if (callbacks && callbacks.failure) {
					callbacks.failure.call(callbacks.scope || this);
				}
				return;
			}

			var json = Ext.decode(r.responseText),
				list = ParseUtils.parseItems(json.Items);

			if(list && list.length>1){
				console.warn('many matching users: "', username, '"', list);
			}

			Ext.each(list,function(u){ if(u.get('Username')===username){result=u;return false;}});

			if(result && callbacks && callbacks.success){
				callbacks.success.call(callbacks.scope || this, result);
			}

			if (!result) {
				if (callbacks && callbacks.failure) {
					callbacks.failure.call(callbacks.scope || this);
				}
				console.error('result is null', username, list, url, json);
			}
		}

		if(this.activeRequests[username] && this.activeRequests[username].options){
//			console.log('active request detected for ' + username);
			options = this.activeRequests[username].options;
			options.callback = Ext.Function.createSequence(
					options.callback,
					function(){
						callback.apply(me,arguments);
					}, me);
			return null;
		}

		this.activeRequests[username] = Ext.Ajax.request({
			url: url,
			scope: me,
			async: !!callbacks,
			callback: callback
		});

		return result;
	},


	getTheEveryoneEntity: function(){
		var w = this.getStore().getById('Everyone');
		if(!w){
			//We should NEVER hit this... but just in case, make it synchronous so its obvoius.
			w = this.makeRequest('Everyone',undefined);
		}
		return w;
	},

	presenceChanged: function(username, presence) {
		var u = this.getStore().getById(username);
		if (u) {
			u.set('Presence', presence);
			u.fireEvent('changed', u);
		}
	}
},
function(){
	window.UserRepository = this;
});
