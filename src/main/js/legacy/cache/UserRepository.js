const Ext = require('extjs');
const {wait} = require('nti-commons');

const User = require('legacy/model/User');
const PresenceInfo = require('legacy/model/PresenceInfo');
const ParseUtils = require('legacy/util/Parsing');
const {isMe, isFeature} = require('legacy/util/Globals');
const {Deferred} = require('legacy/util/Promise');
const ChatStateStore = require('legacy/app/chat/StateStore');

const {$AppConfig = {}} = global;

User.Repository = global.UserRepository =
module.exports = exports = Ext.define('NextThought.cache.UserRepository', {

	isDebug: $AppConfig.userRepositoryDebug,

	constructor: function () {
		Ext.apply(this, {
			store: null,
			activeRequests: {},
			activeBulkRequests: new Ext.util.MixedCollection(),
			queuedBulkRequests: new Ext.util.MixedCollection(),
			pendingResolve: {}
		});

		var active = this.activeBulkRequests,
			queued = this.queuedBulkRequests, task;

		task = Ext.util.TaskManager.newTask({
			interval: 50,
			run () {
				function removeWhenDone (x) {
					return () => active.remove(x);
				}

				let i = $AppConfig.userBatchResolveRequestStagger || 20;
				for (i; i > 0 && queued.getCount() > 0; i--) {
					let t = queued.removeAt(0);
					if (t) {
						t = t();
						if (t) {
							active.add(t);
							t.always(removeWhenDone(t));
						}
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

		this.ChatStore = ChatStateStore.getInstance();

		this.setPresenceChangeListener(this.ChatStore);
	},

	//<editor-fold desc="Private Interfaces">
	getStore: function () {
		if (!this.store) {
			this.store = Ext.data.Store.create({model: 'NextThought.model.User'});
			//By default getById on the store is order n.  given we need to call this to both cache
			//and retrieve data that makes resolving a big chunk of users n^2.	Mixed collection
			//supports constant lookups if you can do it by key (which we can for users) so replace
			//the implementation with something faster.
			this.store.getById = function (theId) {
				return (this.snapshot || this.data).getByKey(theId);
			};
		}
		return this.store;
	},

	setPresenceChangeListener: function (store) {
		store.on('presence-changed', this.presenceChanged, this);
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
					if (this.isDebug) {
						console.log('Asked to precache an appuser that isnt the current $AppConfig.userObject. Dropping');
					}
					return;
				}
			}

			//If the incoming object is a summary object (not from a resolve user call)
			//we don't want to merge into a non summary object.	 We end up losing data
			if (!refreshedUser.summaryObject || u.summaryObject) {
				this.mergeUser(u, refreshedUser);
			}
		}

		if (!u) {
			this.cacheUser(refreshedUser);
		}
	},

	/*searchUser: function (query) {
		var fieldsToMatch = ['Username', 'alias', 'realname', 'email'],
			regex = new RegExp(query),
			matches;
		matches = this.getStore().queryBy(function (rec) {
			var matched = false;

			Ext.each(fieldsToMatch, function (field) {
				var v = rec.get(field);
				if (v && regex.test(v)) {
					matched = true;
				}
				return !matched;
			});

			return matched;
		});
		return matches;
	},*/


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

			s.remove(fromStore);

		}
		if (this.isDebug) {
			console.debug('Adding resolved user to store', user.getId(), user);
		}
		s.add(user);
		return user;
	},

	resolveFromStore: function (key) {
		var s = this.getStore();
		return s.getById(key) || s.findRecord('Username', key, 0, false, true, true) || s.findRecord('NTIID', key, 0, false, true, true);
	},

	//</editor-fold>

	//<editor-fold desc="Public Interface">
	getUser: function (username, callback, scope, forceFullResolve, cacheBust) {
		if (!Ext.isArray(username)) {
			username = [username];
			username.returnSingle = true;
		}

		//Did someone do something stupid and send in an empty array
		if (Ext.isEmpty(username)) {
			Ext.callback(callback, scope, [[]]);
			return Promise.resolve([]);
		}

		var me = this,
			result = {},
			l = username.length,
			names = [],
			toResolve = [],
			canBulkResolve = !forceFullResolve && isFeature('bulk-resolve-users');

		return new Promise(function (fulfill, reject) {

			function maybeFinish (k, v) {
				result[k] = v;
				l -= 1;

				if (l <= 0) {
					result = names.map(function (n) {
						return result[n] || User.getUnresolved(n);
					});

					if (username.returnSingle) {
						result = result.first();
					}
					fulfill(result);
					Ext.callback(callback, scope, [result]);
				}
			}

			username.forEach(function (o) {
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

				r = me.resolveFromStore(name);
				if (r && r.raw && (!forceFullResolve || !r.summaryObject)) {
					maybeFinish(name, r);
					return;
				}

				if (ParseUtils.isNTIID(name)) {
					Service.getObject(name)
						.then(function (u) {
							maybeFinish(name, me.cacheUser(u, true));
						})
						.catch(function () {
							maybeFinish(name);
						});

					return;
				}

				result[name] = null;
				toResolve.push(name);
				//Legacy Path begin:
				if (!canBulkResolve) {
					me.makeRequest(name, {
						scope: me,
						failure: function () {
							maybeFinish(name, User.getUnresolved(name));
						},
						success: function (u) {
							//Note we recache the user here no matter what
							//if we requestsd it we cache the new values
							maybeFinish(name, me.cacheUser(u, true));
						}
					}, cacheBust);
				} else {
					console.debug('Defer to Bulk Resolve...', name);
				}
				//Legacy Path END
			});

			if (toResolve.length > 0 && canBulkResolve) {
				me.bulkResolve(toResolve)
					.then(function (users) {
						//Note we recache the user here no matter what
						//if we requestsd it we cache the new values
						users.forEach(function (u) { maybeFinish(u.getId(), me.cacheUser(u, true)); });
						if (l > 0) {
							l = 0;
							maybeFinish();
						}
					})
					.catch(function (reason) {
						console.error('Failed to bulk resolve: %o %o', toResolve, reason);
						reject(reason);
						fulfill = Ext.emptyFn;
						Ext.callback(callback, scope, [[]]);
					});
			}

		});
	},

	//</editor-fold>


	//<editor-fold desc="Bulk Request">
	/**
	 * Perform a bulk resolve. (and gather as many concurent resolves as posible w/o delaying too long)
	 * @param {String[]} names
	 * @return {Promise}
	 */
	bulkResolve: (function () {
		var toResolve = [],
			pending = [],
			work = Ext.Function.createBuffered(function () {
				var job = pending,
					load = toResolve;

				toResolve = [];
				pending = [];

				console.debug('Resolving in bulk...', load.length);

				this.makeBulkRequest(load)
					.then(function (v) {
						job.forEach(function (p) {
							try {
								p.fulfill(v);
							} catch (e) {
								console.error('%s: %o', e.message, e);
							}
						});
					})
					.catch(function (v) {
						job.forEach(function (p) {
							try {
								p.reject(v);
							} catch (e) {
								console.error('%s: %o', e.message, e);
							}
						});
					});
			}, 10);

		function toWork (names, fulfill, reject) {
			toResolve = Ext.Array.unique(toResolve.concat(names));
			pending.push({
				fulfill: fulfill,
				reject: reject
			});
			work.call(this);
		}

		return function (names) {
			var me = this;

			names = Ext.Array.unique(names);

			return new Promise(function (fulfill, reject) {

				function success (v) {
					var fulfillment = [], x, i;

					for (i = v.length - 1; i >= 0; i--) {

						for (x = names.length - 1; x >= 0; x--) {

							if (v[i] && names[x] === v[i].getId()) {
								fulfillment.push(v[i]);
							}
						}
					}

					if (fulfillment.length !== names.length) {
						console.warn('Length missmatch! Assuming this is due to communities in the list.', names, fulfillment, v);
					}
					fulfill(fulfillment);
				}

				toWork.call(me, names.slice(), success, reject);
			});
		};
	}()),

	makeBulkRequest: function (usernames) {
		var me = this,
			chunkSize = $AppConfig.userBatchResolveChunkSize || 200;

		function rebuild (lists) {
			return me.recompose(usernames, lists);
		}

		return Promise.all(usernames.chunk(chunkSize).map(me.chunkBulkRequest.bind(me)))
			.then(rebuild)
			.catch(function failed (reason) {
				console.error('Failed: %o', reason);
				return Promise.reject(reason);
			});
	},

	recompose: function (names, lists) {
		var agg = [],
			i = lists.length - 1,
			x, list, u, m = {};

		agg.length = names.length;//JSLint doesn't like the Array(size) constructor. SO, lets just do the two-step version. (declare, then assign length :|)

		names.forEach(function (n, ix) { m[n] = ix; });

		//because we may not have the same lists of requested items,
		// we must rebuild based on usernames.
		for (i; i >= 0; i--) {
			list = lists[i] || [];
			for (x = (list.length - 1); x >= 0; x--) {
				u = list[x] && list[x].getId && list[x].getId();
				if (u && m.hasOwnProperty(u)) {
					agg[m[u]] = list[x];
				}
			}
		}
		return agg;
	},

	chunkBulkRequest: function (names) {
		var me = this,
			divert = [], requestNames,
			active = me.pendingResolve;

		requestNames = names.filter(function (n) {
			var a = active[n], u;
			if (a && divert.indexOf(a) === -1) {
				divert.push(a);
			} else {
				u = me.getStore().getById(n);
				if (u) {
					a = Promise.resolve([u]);
					divert.push(a);
				}
			}

			return !a;
		});

		if (requestNames.length > 0) {
			divert.push(me.bulkRequest(requestNames));
		}

		return Promise.all(divert)
			.then(function (lists) {
				return me.recompose(names, lists);
			})
			.catch(function (reason) {
				console.error('Failed: %o', reason);
				return Promise.reject(reason);
			});
	},

	bulkRequest: function (names) {
		var me = this,
			store = me.getStore(),
			active = me.pendingResolve,
			requestQue = me.queuedBulkRequests, p;

		function recieve (json) {
			var u = [];

			json = (json || {}).Items || {};

			store.suspendEvents(true);

			//large sets, use as little extra function calls as possible.
			for (let i = names.length - 1; i >= 0; i--) {
				let n = names[i];
				let o = json[n];
				if (o) {
					o = json[n];
					if (o.MimeType === User.mimeType) {
						o = User.create(o, n);
					} else {
						console.warn('Parsing a non-user: "%s" %o', n, o);
						o = ParseUtils.parseItems(o)[0];
					}
					o.summaryObject = true;
					me.cacheUser(o, true);
					me.updatePresenceFromResolve([o]);
				} else {
					o = User.getUnresolved(n);
				}
				u.push(o);
			}

			store.resumeEvents();


			//schedual cleanup.
			wait(60000).then(function () {
				console.debug('Cleanup...');
				for (let i = names.length - 1; i >= 0; i--) {
					delete active[names[i]];
				}
			});

			return u;
		}

		function fire (fulfill) {

			return wait()
				.then(function () {
					return me.backgroundRequest({
						url: Service.getBulkResolveUserURL(),
						method: 'POST',
						jsonData: {usernames: names}
					});
				})
				.always(recieve)
				.then(fulfill);
		}

		p = new Promise(function (fulfill, reject) {
			requestQue.add(fire.bind(null, fulfill, reject));
		});

		names.forEach(function (n) { active[n] = p; });

		return p;
	},

	foregroundRequest: function () {
		console.log('Requesting in foreground');
		return Service.request.apply(Service, arguments)
			.then(function (txt) { return Ext.decode(txt, true); });
	},

	backgroundRequest: function (req) {
		var w = this.worker, p, a = {};
		if (!w) {
			return this.foregroundRequest(req);
		}

		a = w.active = w.active || a;

		p = new Deferred();//required to be a Deferred, since our worker communication
		// is "evented", we cannot pass a callback. Though, I'm sure we can reorganize
		// this logic to make it more 'proper'

		if (a.hasOwnProperty(p.id)) {
			console.error('ASSERTION FAILED');
			return;
		}

		a[p.id] = p;
		req.id = p.id;
		w.postMessage(req);
		return p;
	},

	workerMessage: function (msg) {
		var data = msg.data,
			w = this.worker, p, a;
		if (!w) {
			Ext.Error.raise('How did you get here without a worker?');
		}

		a = w.active = w.active || {};
		p = a[data.id];
		if (!p) {
			Ext.Error.raise('Bad Message, requet finished, but nothing was listening.');
		}

		delete a[data.id];
		p.fulfill(data.result);
	},

	//</editor-fold>


	/**
	 * Once called, if the user is not in the cache, a placeholder object will be injected. If something requests that
	 * user while its still resolving, the record will not have a 'raw' property and it will have 'placeholder' set true
	 * in the 'data' property.
	 *
	 * @param {String} username username
	 * @param {Object} callbacks callbacks
	 * @param {Boolean} cacheBust cacheBust
	 * @returns {User} null most cases.
	 */
	makeRequest: function (username, callbacks, cacheBust) {
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

		function callback (o, success, r) {

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

			list.forEach(function (u) {
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


		this.activeRequests[username] = Ext.Ajax.request({
			url: url,
			scope: me,
			async: !!callbacks,
			callback: callback
		});

		return result;
	},

	updatePresenceFromResolve: function (list) {
		var store = this.ChatStore;

		list.forEach(function (u) {
			//check if we already have a presence info for them
			var presence = store.getPresenceOf(u.get('Username'));
			if (presence) {
				u.set('Presence', presence);
			}
		});
	},

	presenceChanged: function (username, presence) {
		var u = this.getStore().getById(username), newPresence;
		if (this.debug) {console.log('User repository recieved a presence change for ', username, arguments);}
		newPresence = (presence && presence.isPresenceInfo) ?
			presence :
			PresenceInfo.createFromPresenceString(presence, username);

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
}).create();

/* istanbul ignore next */
function worker () {
	var keep = {
		Class: 1,
		CreatedTime: 1,
		avatarURL: 1,
		Links: 1,
		MimeType: 1,
		NTIID: 1,
		OU4x4: 1,
		Username: 1,
		alias: 1,
		realname: 1,
		NonI18NLastName: 1,
		NonI18NFirstName: 1,
		href: 1,
		//profile fields (can't drop these) It would be nice to not to include these until we view the profile. (separate call?)
		about: 1,
		affiliation: 1,
		description: 1,
		home_page: 1, //eslint-disable-line camelcase
		location: 1,
		role: 1
	};

	// eslint-disable-next-line no-restricted-globals
	self.addEventListener('message', function (e) {
		var resp = {};
		fetch(e.data, function (json, shell) {
			var i, l, o, p;

			resp.id = e.data.id;
			try {
				resp.result = JSON.parse(json);
			} catch (er) {
				console.error(json + '\n', er.stack || er.message || er);
				resp.result = {};
			}

			if (shell) {
				l = (resp.result || {}).Items || {};

				if (l.avatarURL == null) {
					l.avatarURL = '@@avatar';
				}

				for (i in l) {
					if (l.hasOwnProperty(i)) {
						o = l[i];
						for (p in o) {
							if (o.hasOwnProperty(p) && !keep[p]) {
								delete o[p];
							}
						}
						o.shell = true;
					}
				}
			}

			// eslint-disable-next-line no-restricted-globals
			self.postMessage(resp);
		});
	}, false);

	function fetch (data, fn) {
		var req = new XMLHttpRequest();
		req.open('POST', data.url, true);
		if (!data.hasOwnProperty('shell')) {
			data.shell = true;
		}

		req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		req.setRequestHeader('Accept', 'application/json');

		req.onreadystatechange = function () {
			if (req.readyState === 4) {
				if (req.status === 200) {
					fn(req.responseText, data.shell);
				} else {
					fn('Error: ' + req.status);
				}
			}
		};
		req.send(JSON.stringify(data.jsonData));
	}
}


/* istanbul ignore next */
try {
	const code = worker.toString();

	if (Ext.isIE11p) { throw new Error( 'Webworkers are broken in IE11' ); }

	if (/PhantomJS/i.test(navigator.userAgent)) {
		throw new Error('Skip Worker in Unit Tests');
	}

	exports.worker = new Worker(URL.createObjectURL(new Blob(['(', code, ')();'], {type: 'text/javascript'})));
	exports.worker.onmessage = exports.workerMessage.bind(exports);
	exports.worker.onerror = function () {
		delete exports.worker;
		console.error('No Worker for bulk resolve');
	};
} catch (e) {
	console.error('No Worker for bulk resolve');
}
