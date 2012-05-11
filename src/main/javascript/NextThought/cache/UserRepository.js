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
		return (this.store = this.store || Ext.create('Ext.data.Store', {model: 'NextThought.model.User'}));
	},


	updateUser: function(refreshedUser) {
		var s = this.getStore(),
			uid = refreshedUser.getId(),
			u = s.getById(uid),
			raw = refreshedUser.raw,
			ignoreNewInstance = (raw && raw.hasOwnProperty('ignoreIfExists'));

		if (u && (!ignoreNewInstance || !u.equal(refreshedUser))) {
			if ($AppConfig.userObject && u.getId() === $AppConfig.userObject.getId() ){
				if(u !== $AppConfig.userObject) {
					console.warn('AppConfig user instance is different');
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


	getUser: function(username, callback, scope) {
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
	window.UserRepository = this;
	this.prefetchUser = Ext.Function.alias(this, 'getUser');
});
