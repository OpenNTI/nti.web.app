Ext.define('NextThought.cache.UserRepository', {
		alias: 'UserRepository',
		singleton: true,
		isDebug: $AppConfig.userRepositoryDebug,
		requires: [
			'NextThought.util.Parsing'
		],

		constructor: function () {
			Ext.apply(this, {
				store: null,
				activeRequests: {}
			});
		},


		getStore: function () {
			if (!this.store) {
				this.store = Ext.data.Store.create({model: 'NextThought.model.User'});
			}
			return this.store;
		},


		setPresenceChangeListener: function(store){
			store.on('presence-changed',this.presenceChanged,this);
		},


		precacheUser: function (refreshedUser) {
			var s = this.getStore(), uid, u;

			if (refreshedUser.getId === undefined) {
				refreshedUser = ParseUtils.parseItems(refreshedUser)[0];
			}

			uid = refreshedUser.getId();
			u = s.getById(uid); //user from the store

			//console.log('Update user called with', refreshedUser);

			//if the store had the user
			// AND it was not equal to the refreshedUser (the user resolved from the server)
			if (u && !u.equal(refreshedUser)) {
				//If we have a current user, and the user from the store is that user (compared by ID)
				if ($AppConfig.userObject && isMe(u)) {
					//If the INSTANCE of the user from the store does not match the instance of the current user object
					if (u !== $AppConfig.userObject) {
						/*//this is strange...why do we get here?
						console.warn('AppConfig user instance is different');
						//if the user in the store is not the same object as our global reference, then we need to make sure
						// that we fire changed event just incase someone is listening to it.
						$AppConfig.userObject.fireEvent('changed', u);

						//Correct the problem
						$AppConfig.userObject = u;*/
						if(this.isDebug){
							console.log('Asked to precache an appuser that isnt the current $AppConfig.userObject. Dropping');
						}
						return;
					}
				}

				//If the incoming object is a summary object (not from a resolve user call)
				//we don't want to merge into a non summary object.  We end up losing data
				if (!refreshedUser.summaryObject || u.summaryObject) {
					this.mergeUser(u, refreshedUser);
				}
			}

			if (!u) {
				this.cacheUser(refreshedUser);
			}
		},


		searchUser: function(query){
			var fieldsToMatch = ['Username', 'alias', 'realname', 'email'],
				regex = new RegExp(query),
				matches;
			matches = this.getStore().queryBy(function(rec){
				var matched = false;

				Ext.each(fieldsToMatch, function(field){
					var v = rec.get(field);
					if(v && regex.test(v)){
						matched = true;
					}
					return !matched;
				});

				return matched;
			});
			return matches;
		},


		mergeUser: function (fromStore, newUser) {
			//Do an in place update so things holding references to us
			//don't lose their listeners
			//console.debug('Doing an in place update of ', fromStore, 'with', newUser.raw);
			fromStore.set(newUser.raw);

			//For things (hopefully legacy things only) listening to changed events
			fromStore.fireEvent('changed', fromStore);
		},

		cacheUser: function (user, maybeMerge) {
			var s = this.getStore(),
				id = user.getId() || user.raw[user.idProperty],
				fromStore = s.getById(id);
			if (fromStore) {
				if (maybeMerge) {
					this.mergeUser(fromStore, user);
					return fromStore;
				}
				else {
					s.remove(fromStore);
				}
			}
			if(this.isDebug){
				console.debug('Adding resolved user to store', user.getId(), user);
			}
			s.add(user);
			return user;
		},

		resolveFromStore: function (key) {
			var s = this.getStore();
			return s.getById(key) || s.findRecord('Username', key, 0, false, true, true) || s.findRecord('NTIID', key, 0, false, true, true);
		},

		getUser: function (username, callback, scope, forceFullResolve, cacheBust) {
			if (!Ext.isArray(username)) {
				username = [username];
				username.returnSingle = true;
			}

			var s = this.getStore(),
				result = {},
				l = username.length,
				names = [];

			function maybeFinish(k, v) {
				result[k] = v;
				l -= 1;

				if (l === 0) {
					result = Ext.Array.map(names, function (n) {
						return result[n];
					});

					if (username.returnSingle) {
						result = result.first();
					}
					Ext.callback(callback, scope, [result]);
				}
			}

			//Did someone do something stupid and send in an empty array
			if (Ext.isEmpty(username)) {
				Ext.callback(callback, scope, [
					[]
				]);
				return;
			}

			Ext.each(
				username,
				function (o) {
					var name, r;

					if (Ext.isString(o)) {
						name = o;
					}
					else if (o.getId !== undefined) {
						if (o.isUnresolved && o.isUnresolved() === true) {
							names.push(o.getId());
							maybeFinish(o.getId(), o);
							return;
						}
						name = o.getId();
					}
					else {
						//JSON representation of User
						r = ParseUtils.parseItems(o)[0];
						if (!r || !r.getModelName) {
							Ext.Error.raise({message: 'Unknown result', object: r});
						}
						name = r.getId();
					}
					names.push(name);

					r = this.resolveFromStore(name);
					if (r && r.raw && (!forceFullResolve || !r.summaryObject)) {
						maybeFinish(name, r);
						return;
					}

					//console.log('Resolving user on server', name);
					result[name] = null;
					this.makeRequest(name, {
						scope: this,
						failure: function () {
							var unresolved = User.getUnresolved(name);
							//	console.log('resturning unresolved user', name);
							maybeFinish(name, unresolved);
						},
						success: function (u) {
							//Note we recache the user here no matter what
							//if we requestsd it we cache the new values
							maybeFinish(name, this.cacheUser(u, true));
						}
					}, cacheBust);
				},
				this);
		},


		/**
		 * Once called, if the user is not in the cache, a placeholder object will be injected. If something requests that
		 * user while its still resolving, the record will not have a 'raw' property and it will have 'placeholder' set true
		 * in the 'data' property.
		 *
		 * @param username
		 * @param callbacks
		 */
		makeRequest: function (username, callbacks, cacheBust) {
			var me = this,
				result = null,
				url = $AppConfig.service.getResolveUserURL(username),
				options;

			if (cacheBust) {
				url += (url.indexOf('?') < 0 ? '?' : '&')
					+ '_dc=' + (new Date()).getTime();
			}

			if (!username) {
				console.error('no user to look up');
				return null;
			}

			function callback(o, success, r) {

				delete me.activeRequests[username];

				if (!success) {
					if( this.debug ){
						console.warn('There was an error resolving user:', username, arguments);
					}
					if (callbacks && callbacks.failure) {
						callbacks.failure.call(callbacks.scope || this);
					}
					return;
				}

				var json = Ext.decode(r.responseText),
					list = ParseUtils.parseItems(json.Items);

				if (list && list.length > 1) {
					console.warn('many matching users: "', username, '"', list);
				}

				Ext.each(list, function (u) {
					var presence;
					if (u.get('Username') === username) {
						result = u;

						//check if we already have a presence info for them
						presence = Ext.getStore('PresenceInfo').getPresenceOf(result.get('Username'));
						if(presence){
							result.set('Presence',presence);
						}

						result.summaryObject = false;
						return false;
					}
				});

				if (result && callbacks && callbacks.success) {
					callbacks.success.call(callbacks.scope || this, result);
				}

				if (!result) {
					if (callbacks && callbacks.failure) {
						callbacks.failure.call(callbacks.scope || this);
					}


					if(this.debug && (!r.loggedWarn || !r.loggedWarn[username])){
						if(!r.loggedWarn){ r.loggedWarn = {}; }
						r.loggedWarn[username] = true;
						console.warn('{requestID:'+r.requestId+'} result is null', url, r.responseText);
					}
				}
			}

			if (this.activeRequests[username] && this.activeRequests[username].options) {
				//	console.log('active request detected for ' + username);
				options = this.activeRequests[username].options;
				options.callback = Ext.Function.createSequence(
					options.callback,
					function () {
						callback.apply(me, arguments);
					}, me);
				return null;
			}

			console.debug('\n\n\n\nRequesting '+username,'\n\n\n\n');
			this.activeRequests[username] = Ext.Ajax.request({
				url: url,
				scope: me,
				async: !!callbacks,
				callback: callback
			});

			return result;
		},

		presenceChanged: function (username, presence) {
			var u = this.getStore().getById(username),newPresence;
			if(this.debug){console.log('User repository recieved a presence change for ', username, arguments);}
			newPresence = (presence && presence.isPresenceInfo)
					? presence
					: NextThought.model.PresenceInfo.createFromPresenceString(presence,username);

			if (u) {
				if( this.debug ){
					console.debug('updating presence for found user', u);
				}
				u.set('Presence', newPresence);
				u.fireEvent('changed', u);
			}
			else if(this.debug) {
				console.debug('no user found to update presence');
			}
		}
	},
	function () {
		window.UserRepository = this;
	});
