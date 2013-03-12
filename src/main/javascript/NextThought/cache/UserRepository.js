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
		var s = this.getStore(), uid, u;

		if(refreshedUser.getId === undefined){
			refreshedUser = ParseUtils.parseItems(refreshedUser)[0];
		}

		uid = refreshedUser.getId(),
		u = s.getById(uid); //user from the store

		console.log('Update user called with', refreshedUser);

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

			this.mergeUser(u, refreshedUser);
		}

		if(!u){
			this.cacheUser(refreshedUser);
		}
	},


	mergeUser: function(fromStore, newUser){
		//Do an in place update so things holding references to us
		//don't lose their listeners
		console.debug('Doing an in place update of ', fromStore, 'with', newUser.raw);
		fromStore.set(newUser.raw);

		//For things listening to changed events
		fromStore.fireEvent('changed', fromStore);
	},

	cacheUser: function(user, maybeMerge){
		var s = this.getStore(),
			id = user.getId() || user.raw[user.idProperty],
			fromStore = s.getById(id);
		if(maybeMerge && fromStore){
			this.mergeUser(fromStore, user);
			return fromStore;
		}
		console.debug('Adding resolved user to store', user.getId(), user);
		this.getStore().add(user);
		return user;
	},

	resolveFromStore: function(key){
		var s = this.getStore();
		return s.getById(key) || s.findRecord('Username', key, 0, false, true, true) || s.findRecord('NTIID',key,0,false,true,true);
	},

	getUser: function(username, callback, scope, forceFullResolve) {
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
				if (r && r.raw && (!forceFullResolve || !r.summaryObject)){
					result.push(r);
					return;
				}

				//console.log('Resolving user on server', name);

				//must make a request, finish in callback so set async flag
				async = true;
				this.makeRequest(name, {
					scope: this,
					failure: function(){
					//	console.log('resturning unresolved user', name);
						result.push(User.getUnresolved(name));
						if (result.length === l) {
							finish();
						}
					},
					success: function(u){
						//Note we recache the user here no matter what
						//if we requestsd it we cache the new values
						result.push(this.cacheUser(u, true));

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

			Ext.each(list,function(u){
				if(u.get('Username')===username){
					result=u;
					result.summaryObject = false;
					return false;
				}
			});

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
		//	console.log('active request detected for ' + username);
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

	presenceChanged: function(username, presence) {
		var u = this.getStore().getById(username);
		console.log('User repository recieved a presence change for ', username, arguments);
		if (u) {
			console.debug('updating presence for found user', u);
			u.set('Presence', presence);
			u.fireEvent('changed', u);
		}
		else{
			console.debug('no user found to update presence');
		}
	}
},
function(){
	window.UserRepository = this;
});
