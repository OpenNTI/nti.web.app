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

	has: function(username){
		if(typeof username === 'object'){
			if( username instanceof Ext.data.Model){
				username = username.getId();
			}
			else {
				username = username.Username;
			}
		}

		var user = this.getStore().getById(username);
		return user && user.raw && !user.raw.hasOwnProperty('ignoreIfExists') && !user.raw.hasOwnProperty('childRecord');
	},

	getStore: function() {
		return (this.store = this.store || Ext.create('Ext.data.Store', {model: 'NextThought.model.User'}));
	},

	refresh: function() {
		var s = this.store;
		if (!s) {
			return;
		}

		s.each(function(u){
			this.makeRequest(u.getId(), {
				scope:this,
				success: Ext.emptyFn, //loading into the store happens automatically because of the User model constructor.
				failure: function(){
					console.error('something went wrong making request', arguments, u);
				}
			});
		},
		this);
	},

	updateUser: function(refreshedUser) {
		var s = this.getStore(),
			uid = refreshedUser.getId(),
			u = s.getById(uid),
			ignoreNewInstance = (refreshedUser.raw && (refreshedUser.raw.hasOwnProperty('ignoreIfExists') || refreshedUser.raw.hasOwnProperty('childRecord')));


//		console.debug('updateUser',ignoreNewInstance, refreshedUser.getId(), u, refreshedUser);

		if (u && ((!ignoreNewInstance || !u.raw) || !u.equal(refreshedUser))) {
			if ($AppConfig.userObject && u.getId() === $AppConfig.userObject.getId() ){
				if(u !== $AppConfig.userObject) {
					$AppConfig.userObject.fireEvent('changed', refreshedUser);
				}
				$AppConfig.userObject = refreshedUser;
			}

			u.fireEvent('changed', refreshedUser);
			s.remove(u);
			//console.debug('updateUser: refreshing...',refreshedUser.getId());
			u=null;
		}

		if(!u){
//			console.debug('updateUser: adding...',refreshedUser.getId());
			if (ignoreNewInstance){
				delete refreshedUser.raw;
			}
			s.add(refreshedUser);
		}
	},

	prefetchUser: function(username, callback, scope) {
		if (!Ext.isArray(username)) {
			username = [username];
		}

		var s = this.getStore(),
			result = [],
			l = username.length,
			async = false;

		function finish() {
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
				else if(typeof(o.getId)!== 'undefined'){
					name = o.getId();
				}
				else {
					//JSON representation of User
					r = ParseUtils.parseItems(o, {ignoreIfExists: true})[0];
					if(!r || !r.getModelName){
						Ext.Error.raise({message: 'Unknown result', object: r});
					}
					name = r.getId();
				}

				r = s.getById(name);
				if (r && r.raw){
					result.push(r);
					return;
				}

				//must make a request, finish in callback so set async flag
				async = true;
				this.makeRequest(name, {
					scope: this,
					failure: function(){
						l--; //dec length so we still hit our finish state when a failure occurs.
						if (l === 0) {
							finish();
						}
					},
					success: function(u){
						//s.add(u); not necessary since the user model calls update
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


	getUser: function(username, raw) {
		var user = this.getStore().getById(username);

		if (!user) {
			user = raw? ParseUtils.parseItems([raw])[0] : this.makeRequest(username);
			//user's constructor adds the user to the repo, so do the following only if the user is different somehow,
			//this is more of an assertion.  The reason we have to do this is because things are listening to events
			//on user instances in this repository so we cant just replace them.
			if (user && user !== this.getStore().getById(username)) {
				console.warn('user does not equal user in store', user, this.getStore().getById(username));
				//this.getStore().add(user);
			}
		}

		return user;
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
			s = me.getStore(),
			url = $AppConfig.service.getUserSearchURL(username),
			options;

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
				list = ParseUtils.parseItems(json.Items, {ignoreIfExists: true});

			if(list && list.length>1){
				console.warn('many matching users: "', username, '"', list);
			}

			result = list ? list[0] : null;

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
			return;
		}

		if(this.has(username)){
			console.error('um...why are we requesting a resolve for something we already have??');
		}

		s.add({Username:username, placeholder: true});//make this.has return return true now...
//		console.log('adding active request for ' + username);
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
		if (u) {
			u.set('Presence', presence);
			u.fireEvent('changed', u);
		}
	},

	isOnline: function(username) {
		var u = this.getUser(username);

		return u && !/offline/i.test(u.get('Presence'));
	}

},
function(){
	window.UserRepository = NextThought.cache.UserRepository;
});
