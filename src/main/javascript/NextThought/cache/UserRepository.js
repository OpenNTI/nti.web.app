Ext.define('NextThought.cache.UserRepository', {
		alias: 'UserRepository',
		singleton: true,
		isDebug: $AppConfig.userRepositoryDebug,
		requires: [
			'NextThought.util.Parsing'
		],

		constructor: function() {
			Ext.apply(this, {
				store: null,
				activeRequests: {},
				_activeBulkRequests: new Ext.util.MixedCollection(),
				_queuedBulkRequests: new Ext.util.MixedCollection(),
				_pendingResolve: {}
			});

			var active = this._activeBulkRequests,
				queued = this._queuedBulkRequests,
				task = Ext.util.TaskManager.newTask({
				interval: 250,
				run: function() {
					var t;
					function removeWhenDone(t) {
						return function() {
							active.remove(t);
						};
					}
					while (active.getCount() < 10 && queued.getCount() > 0) {
						t = queued.removeAt(0);
						if (t) {
							t = t();
							active.add(t);
							t.always(removeWhenDone(t));
						} else {
							task.stop();
						}
					}
					if (queued.getCount() === 0) {
						task.stop();
					}
				}
			});

			queued.on('add', 'start', task);
		},


		//<editor-fold desc="Private Interfaces">
		getStore: function() {
			if (!this.store) {
				this.store = Ext.data.Store.create({model: 'NextThought.model.User'});
			}
			return this.store;
		},


		setPresenceChangeListener: function(store) {
			store.on('presence-changed', this.presenceChanged, this);
		},


		precacheUser: function(refreshedUser) {
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
						if (this.isDebug) {
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


		searchUser: function(query) {
			var fieldsToMatch = ['Username', 'alias', 'realname', 'email'],
				regex = new RegExp(query),
				matches;
			matches = this.getStore().queryBy(function(rec) {
				var matched = false;

				Ext.each(fieldsToMatch, function(field) {
					var v = rec.get(field);
					if (v && regex.test(v)) {
						matched = true;
					}
					return !matched;
				});

				return matched;
			});
			return matches;
		},


		mergeUser: function(fromStore, newUser) {
			//Do an in place update so things holding references to us
			//don't lose their listeners
			//console.debug('Doing an in place update of ', fromStore, 'with', newUser.raw);
			fromStore.set(newUser.raw);

			//For things (hopefully legacy things only) listening to changed events
			fromStore.fireEvent('changed', fromStore);
		},

		cacheUser: function(user, maybeMerge) {
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
			if (this.isDebug) {
				console.debug('Adding resolved user to store', user.getId(), user);
			}
			s.add(user);
			return user;
		},

		resolveFromStore: function(key) {
			var s = this.getStore();
			return s.getById(key) || s.findRecord('Username', key, 0, false, true, true) || s.findRecord('NTIID', key, 0, false, true, true);
		},
		//</editor-fold>

		//<editor-fold desc="Public Interface">
			getUser: function(username, callback, scope, forceFullResolve, cacheBust) {
			if (!Ext.isArray(username)) {
				username = [username];
				username.returnSingle = true;
			}

			var promise = new Promise(),
				me = this,
				result = {},
				l = username.length,
				names = [],
				toResolve = [];

			function maybeFinish(k, v) {
				result[k] = v;
				l -= 1;

				if (l === 0) {
					result = names.map(function(n) {
						return result[n];
					});

					if (username.returnSingle) {
						result = result.first();
					}
					promise.fulfill(result);
					Ext.callback(callback, scope, [result]);
				}
			}

			//Did someone do something stupid and send in an empty array
			if (Ext.isEmpty(username)) {
				promise.fulfill([]);
				Ext.callback(callback, scope, [[]]);
				return promise;
			}

			Ext.each(
				username,
				function(o) {
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

					//if we are given an ntiid call getObject instead of makeRequest
					if (ParseUtils.isNTIID(name)) {
						Service.getObject(name, function(u) {
							maybeFinish(name, this.cacheUser(u, true));
						}, function() {
							var unresolved = User.getUnresolved('Unknown');//dont show ntiid
							//failed to get by ntiid
							maybeFinish(name, unresolved);
						}, this);
					} else {
						toResolve.push(name);
						//Legacy Path begin:
						if (!isFeature('bulk-resolve-users')) {
							this.makeRequest(name, {
								scope: this,
								failure: function() {
									var unresolved = User.getUnresolved(name);
									//	console.log('resturning unresolved user', name);
									maybeFinish(name, unresolved);
								},
								success: function(u) {
									//Note we recache the user here no matter what
									//if we requestsd it we cache the new values
									maybeFinish(name, this.cacheUser(u, true));
								}
							}, cacheBust);
						} else {
							console.debug('Defer to Bulk Resolve...', name);
						}
						//Legacy Path END
					}
				},
				this);

			if (toResolve.length > 0 && isFeature('bulk-resolve-users')) {
				console.debug('Resolving in bulk...', toResolve.length);
				this.makeBulkRequest(toResolve)
					.done(function(users) {
						//Note we recache the user here no matter what
						//if we requestsd it we cache the new values
						users.forEach(function(u) {
							maybeFinish(u.getId(), me.cacheUser(u, true));
						});
					});
			}

			return promise;
		},
			//</editor-fold>


		makeBulkRequest: function(usernames) {
			var me = this,
				p = new Promise(),
				chunkSize = 100;

			function failed(reason) {
				console.error('Failed:', reason);
				p.reject(reason);
			}

			function rebuild(lists) {
				p.fulfill(me.__recompose(usernames, lists));
			}

			Promise.pool(usernames.chunk(chunkSize).map(me.__chunkBulkRequest.bind(me)))
					.done(rebuild)
					.fail(failed);

			return p;
		},


		__recompose: function(names, lists) {
			var agg = new Array(names.length),
				i = lists.length - 1,
				x, list, u, m = {};

			names.forEach(function(n, i) { m[n] = i; });

			//because we may not have the same lists of requested items,
			// we must rebuild based on usernames.
			for (i; i >= 0; i--) {
				list = lists[i] || [];
				for (x = (list.length - 1); x >= 0; x--) {
					u = list[x].getId();
					if (m.hasOwnProperty(u)) {
						agg[m[u]] = list[x];
					}
				}
			}
			return agg;
		},


		__chunkBulkRequest: function(names) {
			var p = new Promise(), me = this,
				divert = [], requestNames,
				active = me._pendingResolve;

			requestNames = names.filter(function(n) {
				var a = active[n];
				if (a && divert.indexOf(a) === -1) {
					divert.push(a);
				}
				return !a;
			});

			if (requestNames.length > 0) {
				divert.push(me.__bulkRequest(requestNames));
			}

			Promise.pool(divert)
				.done(function(lists) {
					p.fulfill(me.__recompose(names, lists));
				})
				.fail(function(reason) {
					console.error('Failed:', reason);
					p.reject(reason);
				});

			return p;
		},


		__bulkRequest: function(names) {
			var p = new Promise(),
				me = this,
				active = me._pendingResolve,
				requestQue = me._queuedBulkRequests;

			names.forEach(function(n) { active[n] = p; });

			function fire() {
				var working = new Promise();
				setTimeout(function() {
					console.log('Requesting ' + names.length);
					Service.request({
						url: Service.getBulkResolveUserURL(),
						method: 'POST',
						jsonData: {usernames: names}
					})
						.always(function recieve(json) {
							var u = [], i = names.length - 1, o, n;

							json = (Ext.decode(json, true) || {}).Items || {};

							//large sets, use as little extra function calls as possible.
							for (i; i >= 0; i--) {
								n = names[i];
								o = json[n];
								if (o) {
									o = User.create(json[n], n);
									o.summaryObject = false;
									me.updatePresenceFromResolve([o]);
								} else {
									o = User.getUnresolved(n);
								}
								u.push(o);
							}


							//schedual cleanup.
							setTimeout(function() {
								console.debug('Cleanup...');
								var i = names.length - 1;
								for (i; i >= 0; i--) {
									delete active[names[i]];
								}
							}, 60000);


							p.fulfill(u);
							working.fulfill();

						});
				},1);
				return working;
			}

			requestQue.add(fire);

			return p;
		},


		/**
		 * Once called, if the user is not in the cache, a placeholder object will be injected. If something requests that
		 * user while its still resolving, the record will not have a 'raw' property and it will have 'placeholder' set true
		 * in the 'data' property.
		 *
		 * @param username
		 * @param callbacks
		 */
		makeRequest: function(username, callbacks, cacheBust) {
			var me = this,
				result = null,
				url = Service.getResolveUserURL(username),
				options;

			if (cacheBust) {
				url += (url.indexOf('?') < 0 ? '?' : '&') + '_dc=' + (new Date()).getTime();
			}

			if (!username) {
				console.error('no user to look up');
				return null;
			}

			function callback(o, success, r) {

				delete me.activeRequests[username];

				if (!success) {
					if (this.debug) {
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

				list.forEach(function(u) {
					if (u.get('Username') === username) {
						result = u;
						u.summaryObject = false;
						return false;
					}
				});

				me.updatePresenceFromResolve(list);

				if (result && callbacks && callbacks.success) {
					callbacks.success.call(callbacks.scope || this, result);
				}

				if (!result) {
					if (callbacks && callbacks.failure) {
						callbacks.failure.call(callbacks.scope || this);
					}


					if (this.debug && (!r.loggedWarn || !r.loggedWarn[username])) {
						if (!r.loggedWarn) { r.loggedWarn = {}; }
						r.loggedWarn[username] = true;
					}
				}
			}

			if (this.activeRequests[username] && this.activeRequests[username].options) {
				//	console.log('active request detected for ' + username);
				options = this.activeRequests[username].options;
				options.callback = Ext.Function.createSequence(
					options.callback,
					function() {
						callback.apply(me, arguments);
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


		updatePresenceFromResolve: function(list) {
			list.forEach(function(u) {
				//check if we already have a presence info for them
				var presence = Ext.getStore('PresenceInfo').getPresenceOf(u.get('Username'));
				if (presence) {
					u.set('Presence', presence);
				}
			});
		},

		presenceChanged: function(username, presence) {
			var u = this.getStore().getById(username), newPresence;
			if (this.debug) {console.log('User repository recieved a presence change for ', username, arguments);}
			newPresence = (presence && presence.isPresenceInfo)
					? presence
					: NextThought.model.PresenceInfo.createFromPresenceString(presence, username);

			if (u) {
				if (this.debug) {
					console.debug('updating presence for found user', u);
				}
				u.set('Presence', newPresence);
				u.fireEvent('changed', u);
			}
			else if (this.debug) {
				console.debug('no user found to update presence');
			}
		}
	},
	function() {
		window.UserRepository = this;
	});
