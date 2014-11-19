PREVIOUS_STATE = 'previous-state';

(function() {

	var history = window.history,
		push = (history.pushState || Ext.emptyFn),
		replace = (history.replaceState || Ext.emptyFn);

	function Transaction(transactionId, stateCtlr, parentTransaction) {
		this.id = transactionId;
		this.ctlr = stateCtlr;
		this.refs = 1;
		this.parent = parentTransaction;
		if (this.parent) {
			this.parent.hooked = true;
		}
		console.error(transactionId + ' Opened');
		this.txn = [];
	}
	Transaction.prototype = {
		isOpen: function() { return !!this.txn; },


		getId: function() {return this.id;},


		abort: function() { this.close(); },


		close: function() {
			var ctlr = this.ctlr;
			if (this.isOpen()) {
				delete this.txn;
				delete this.ctlr;
				ctlr.closeActiveTransaction(this);
				console.error(this.id + ' Closed');
			}
		},


		getInfo: function() {
			return {
				Open: this.isOpen(),
				id: this.getId(),
				refs: this.refs,
				length: this.txn ? this.txn.length : null,
				parent: this.parent && this.parent.getInfo()
			};
		},


		toString: function() {
			return JSON.stringify(this.getInfo());
		},


		commit: function() {
			this.refs--;
			var state, replace = false, title = '', url = '';

			if (!this.isOpen()) {
				console.error('Attempting to commit a closed transaction.');
				return;
			}

			if (this.refs !== 0) {
				console.debug('Waiting for the last reference to commit');
				return;
			}

			try {
				state = Ext.clone(this.ctlr.currentState);
				this.txn.forEach(function(part) {
					var action = part.action || 'pushState',
							payload = part.payload;

					replace = action === 'replaceState';
					title = part.title || '';
					url = part.url || '';

					if (action === 'replaceState') {
						state = payload;
					}
					else if (action === 'pushState') {
						Ext.Object.merge(state, payload);
					}
					else {
						Ext.Error.raise('Unknown state transaction action', part);
					}
				});
			}
			catch (e) {
				console.error('An error occurred gather state transaction. Aborting transaction', this.txn, e.stack || e.message || e);
				return;
			}

			this.close();
			console.debug('State transaction ended: ', this.id);
			history[replace ? 'replaceState' : 'pushState'](state, title, url);

		},


		_incRef: function() {this.refs++;},


		_add: function(o) {
			this.txn.push(o);
		}
	};

	history.observable = new Ext.util.Observable();

	Ext.define('NextThought.controller.State', {
		extend: 'Ext.app.Controller',

		//<editor-fold desc="Config">
		models: [
			'User'
		],

		requires: [
			'NextThought.cache.AbstractStorage',
			'Ext.state.Manager',
			'Ext.state.LocalStorageProvider',
			'Ext.state.CookieProvider'
		],

		hasPushState: Boolean(history.pushState),

		transactions: {},

		enableTransactions: true,

		currentStateVersion: 4,
		//</editor-fold>


		//<editor-fold desc="Init">
		constructor: function() {
			this.callParent(arguments);

			this.fragmentInterpreterMap = {
				'#!profile': Ext.bind(this.interpretProfileFragment, this),
				'#!forums': Ext.bind(this.interpretForumsFragment, this),
				'#!object': Ext.bind(this.interpretObjectFragment, this),
				'#!library': Ext.bind(this.interpretLibraryFragment, this)
			};

			this.generateFragmentMap = {};
		},

		init: function() {
			this.application.on('session-ready', this.onSessionReady, this);

			this.currentState = {};

			this.isHangout = this.getController('Google').isHangout();

			this.listen({
				component: {
					'main-views view-container': {
						'activate-view': 'track'
					},
					'*': {
						'change-hash': 'changeHash'
					}
				},
				controller: {
					'*': {
						'change-hash': 'changeHash'
					}
				}
			});
			//TODO: can we get rid of this?
			ContentAPIRegistry.register('NTIPreviousPage', function() { history.back(); return true; }, this);
		},
		//</editor-fold>


		//<editor-fold desc="Deprecations">
		changeHash: function(hash) {
			if (!hash || hash.indexOf('#') !== 0 || window.location.hash === hash) {
				return;
			}
			console.error('Modifying window.location.hash', hash);
			location.hash = hash;
		},
		//</editor-fold>


		//<editor-fold desc="History API Hooks">
		onSessionReady: function() {
			var me = this,
				SEVEN_DAYS = 604800000,
				p = me.getStateKey() + 'non-history-state-',
				provider = Ext.supports.LocalStorage ?
					new Ext.state.LocalStorageProvider({prefix: p}) :
					new Ext.state.CookieProvider({prefix: p, expires: new Date(new Date().getTime() + SEVEN_DAYS) });

			Ext.state.Manager.setProvider(provider);


			//TODO: start using history.(*)Transaction functions instead of events. Looks cleaner. Feels better.
			history.beginTransaction = Ext.bind(this.beginTransaction, this);

			/**
			 * Update the application's state object from various actions in this controller.
			 *
			 * @param {Object} s The new state fragment, it will be merged into the current state, replacing keys it has,
			 *                      and leaving keys it does not have alone.
			 * @return {Boolean} Returns true if the state was changed, false otherwise.
			 */
			function updateState(s) {
				function isDiff(a, b) {
					var ret = false;

					Ext.Object.each(b, function objItr(key, val) {
						if (!Ext.isObject(val)) {
							//Not an object do identity comparison
							if (!a || a[key] !== val) {
								ret = true;
							}
						}
						else if (!a || isDiff(a[key], val)) { //Ok so val is an object do a deep equals
							ret = true;
						}

						return !ret;//a false value will stop the iteration, if we find a
					});
					return ret;
				}

				var current = me.currentState,
					diff = isDiff(current, s);
				console.debug('update state', arguments);
				Ext.applyIf(s, {active: current.active, version: me.currentStateVersion});

				console.debug('Will state change?', diff);

				//The only thing listening to this event is the Google Hangout controller.
				if (diff && me.fireEvent('stateChange', s)) {
					Ext.Object.merge(current, s);
					ObjectUtils.clean(current);//drop keys with null & undefined values
					PersistentStorage.set(me.getStateKey(), current);
					return true;
				}

				return false;
			}


			history.pushState = function(s, title, url) {
				var args, txn = me.activeTransaction;

				if (me.restoringState) {return;}

				if (!me.isPoppingHistory && txn) {
					console.log('Applying push state to transaction', txn.getId(), arguments);
					txn._add({
						action: 'pushState',
						payload: s,
						title: title,
						url: url
					});
					return;
				}

				if (updateState(s) && !me.isPoppingHistory) {

					//console.trace();
					console.debug('push state', s);

					if (!url) {
						url = me.generateFragment(me.currentState);
					}

					if (!s || !url) {
						console.warn('Should provide both state and a url', arguments);
					}

					//updateState already updated current if it returned true
					args = [Ext.encode(me.currentState), title, url];
					console.log('Pushing to history', args);
					push.apply(history, args);


					//me = State controller. (this = window.history) And, we only want to change the fragment if we do not
					// support history.pushState natively.
					if (!me.hasPushState && url) {
						//The intention is we only get here for IE9 so lets make sure that is the case
						if (!Ext.isIE9) {
							console.error('Why are we getting here?');
						}
						me.changeHash(url);
					}
				}
			};


			history.replaceState = function(s, title, url) {
				var args, txn = me.activeTransaction;

				if (me.restoringState) {return;}

				//console.trace();
				console.debug('replace state', s);

				if (txn) {
					console.log('Applying replace state to transaction', txn, arguments, me.isPoppingHistory);
					txn._add({
						action: 'replaceState',
						payload: s,
						title: title,
						url: url
					});
					return;
				}

				if (updateState(s)) {

					args = [
						Ext.encode(me.currentState),
						title,
						url || me.generateFragment(me.currentState)
					];
					replace.apply(history, args);
				}
			};


			window.onpopstate = function(e) {
				me.isPoppingHistory = true;
				history.observable.fireEvent('pop', e.state);
				if (e.state !== null) {
					console.debug('Browser is popping state, new state appling: ', Ext.decode(e.state, true) || e.state);
					me.onPopState(e);
				}
				me.isPoppingHistory = false;
			};


			window.onhashchange = function() {
				if (me.restoringState) {return;}
				//Hash changes are their own entry in the history... so we do not need to push history, we just need to
				// handle the change.
				console.debug('Hash change');
				var newState = me.interpretFragment(location.hash);
				if (updateState(newState)) {
					console.debug('restoring state from hash change', newState);
					me.restoreState(newState);
					history.replaceState(me.getState(), document.title, location.toString());
				}
			};
		},
		//</editor-fold>


		//<editor-fold desc="Transaction Defs">
		closeActiveTransaction: function(txn) {
			var active = this.activeTransaction;

			if (txn && active !== txn) {
				console.warn('Bad transaction passed');
				return;
			}

			delete this.activeTransaction;
			if (active && active.isOpen()) {
				active.close();
			}
		},


		beginTransaction: function(transactionId) {
			if (!this.enableTransactions) {
				return;
			}

			if (!this.activeTransaction) {
				this.activeTransaction = new Transaction(transactionId, this);
			} else {
				this.activeTransaction._incRef();
				console.error('Transaction already open. (' + this.activeTransaction + ') ' +
						'Attempted to create a new transaction with id: ' + transactionId + '. ' +
						'Ignoring and returning the current transactoin.');
			}

			return this.activeTransaction;
		},
		//</editor-fold>


		//<editor-fold desc="Fragment Functions">
		//Legacy forums fragment
		interpretForumsFragment: function(fragment, query) {
			var parts = (fragment || '').split('/').slice(0),
				result = {}, forums = {};

			parts = Ext.Array.clean(parts);

			console.debug('Fragment:', fragment, 'Query: ', query, 'Parts', parts);

			//We expect something of the form
			//"#!forums/u/NextThought/board1/forum1/topic1"
			//Right now the 'u' signifies what follows is the community
			//name that onse the board (or really any user like object probably suffices.

			if ((parts[0] || '').toLowerCase() === '#!forums') {
				result.active = 'forums';
				parts = parts.slice(1);

				//We expect at least two parts ('u', and '{community}')
				if (parts.length >= 2 && parts[0] === 'u') {
					forums.board = {community: parts[1], isUser: true};
					forums.forum = parts[2];
					forums.topic = parts[3];
					forums.comment = parts[4];
					result.forums = forums;
				}
			}
			return result;
		},


		interpretProfileFragment: function(fragment, query) {
			var result = {},
				user = this.getUserModel().getProfileStateFromFragment(fragment);
			if (user) {
				result = {
					active: 'profile',
					profile: user
				};
				if (query) {
					result.profile.queryObject = query;
				}
			}
			return result;
		},


		interpretObjectFragment: function(fragment, query) {
			var domain, me = this,
				parts = (fragment || '').split('/').slice(0);

			parts = Ext.Array.clean(parts);
			console.debug('Fragment:', fragment, 'Query: ', query, 'Parts', parts);

			if ((parts[0] || '').toLowerCase() === '#!object') {
				domain = parts[1];
				parts = parts.slice(2).map(decodeURIComponent);

				if (domain === 'ntiid' && parts.length === 1 && ParseUtils.parseNTIID(parts[0])) {
					(this.restoringState || wait()).then(function() {
						me.fireEvent('show-ntiid', parts[0], null, null, null, function() {
							alert('There was a problem navigating to the destination. Check the address and try again.');
						});
					});
				}
			}
			//if we are restoring an object from the url, we don't want to restore the slidedeck from the state
			return {slidedeck: null};
		},


		/**
		 * Parse the state from a library url that looks like
		 *
		 * /#!library/{window}/{activeItem}/{enrollmentOption}/{optionConfig}
		 *
		 * where
		 * window = 'availableCourses' to open the course library
		 * activeItem = B64 url friendly ntiid of the item to show
		 *  if the activeItem is a course
		 *      enrollmentOption = String the name of an enrollment option to start down the path of
		 *      optionConfig = list of configs to pass to the option (ex /token for redeeming gifts)
		 *
		 * @param  {String} fragment the url fragment
		 * @param  {Object} query    the query params
		 * @return {Object}          the state to restore to
		 */
		interpretLibraryFragment: function(fragment, query) {
			var parts = (fragment || '').split('/').slice(1), //split on / and slice the #!library off the front
				result = {
					active: 'library',
					library: {}
				};

			if (parts.length > 0) {

				if (parts[0].toLowerCase() === 'availablecourses') {
					result.library.activeWindow = 'courses';
				}

				if (parts[1]) {
					result.library.activeId = B64.decodeURLFriendly(parts[1]);
				}

				if (parts[2]) {
					result.library.enrollmentOption = parts[2];
					result.library.enrollmentConfig = parts.slice(3);
				}
			}

			return result;
		},


		generateFragment: function(state) {
			var root = (state.active || '').toLowerCase(),
				fragment, generated;

			if (root) {
				fragment = '#!' + root;
			}

			if (this.generateFragmentMap[root]) {
				//We pass it the state for that particular tab
				generated = this.generateFragmentMap[root](state[root] || {});
				if (generated) {
					return [fragment, generated].join('/');
				}
			}

			return null;
		},


		interpretFragment: function(fragmentStr) {
			fragmentStr = fragmentStr.split('?');
			var query = ParseUtils.parseQueryString(fragmentStr[1]),
				fragment = fragmentStr[0] || '',
				root = (fragment.substr(0, fragment.indexOf('/')) || fragment).toLowerCase(),
				ntiid = ParseUtils.parseNtiFragment(fragment),
				result = {};


			if (this.fragmentInterpreterMap.hasOwnProperty(root)) {
				result = this.fragmentInterpreterMap[root](fragment, query);
			}
			else if (ntiid) {
				result = {active: 'content', content: {activeTab: null, location: ntiid}};
			}

			console.debug('Fragment interpreted:', result);
			return result;
		},


		interpretQueryParams: function(search) {
			var state = Ext.Object.fromQueryString(search, true),
				a = document.createElement('a');

			if (!state || !state.hasOwnProperty('active')) {
				state = {};
			}

			a.href = location.toString();

			a.search = '';

			//lets cleanup our search string too, shall we? (but do NOT clobber the fragment!)
			replace.call(history, document.title, history.state,
					a.href.replace('?', ''));//the search blank out does not remove the delimiter... clean that up too

			return state;
		},
		//</editor-fold>


		//<editor-fold desc="Handlers">
		onPopState: function(e) {
			if (!NextThought.isInitialized || this.isHangout) {
				return;
			}
			var s = e ? e.state : null;
			if (!s) {
				console.warn('there is no state to restore?? Will use initial.', e);
			}
			this.restoreState(Ext.decode(s, true) || s || this.initialState || {});
		},


		track: function(viewId, silent) {
			var state = {active: viewId};

			if (!silent && this.currentState.active !== viewId && NextThought.isInitialized) {
				history.pushState(state, document.title, './');
			}
		},
		//</editor-fold>


		restoreState: function(stateObject) {
			var me = this,
				history = window.history;

			if (me.restoringState) {
				console.warn('Restoring state while one is already restoring...');
				return;
			}

			function applyChanges(key, modState) {
				return function() {
					var o = me.currentState[key],
						m = modState[key],
						keys = Object.keys(o);

					Ext.apply(o, m);

					keys.forEach(function(key) {
						if (!m.hasOwnProperty(key)) {
							delete o[key];
						}
					});
				};
			}

			me.restoringState = new Promise(function(fulfill, reject) {
				//let the body of this function return so the promise is setup and ready for use
				wait()
						//then do our work
						.then(function() {
							var tasks = [],
								replaceState = false,
								c, key, stateScoped;
							if (stateObject === PREVIOUS_STATE) {
								replaceState = true;
								stateObject = me.loadState();
								ObjectUtils.clean(stateObject);//drop keys with null & undefined values
								if (history.updateState) {
									history.updateState(stateObject);
								}
							}

							// we can get cancelled ?? The browser doesn't let us prevent the back event,...so this should force it and block the 'block'
							if (me.fireEvent('show-view', stateObject.active, true, true) === false) {
								//this should NEVER happen.
								throw 'Blocked by a UI element with a Napoleon complex.';
							}

							me.currentState.active = stateObject.active;
							me.currentState.version = me.currentStateVersion;

							if (stateObject.active && !stateObject[stateObject.active]) {
								stateObject[stateObject.active] = {};
							}

							for (key in stateObject) {
								if (stateObject.hasOwnProperty(key)) {
									c = me.getStateRestorationHandlerFor(key);
									if (c && c.restore) {
										try {
											stateScoped = Ext.clone(stateObject);
											me.currentState[key] = stateObject[key];
											tasks.push(c.restore(stateScoped)
													.then(applyChanges(key, stateScoped)));
										}
										catch (e) {
											console.error('Setting state: ', e, e.message, e.stack);
										}
									}
									else if (/object/i.test(typeof stateObject[key])) {
										console.warn('Could not find a handler to restore: ', key);
									}
								}
							}


							return Promise.all(tasks)
								.always(function() {
									me.restoringState = false;

									if (replaceState) {
										ObjectUtils.clean(me.currentState);//drop keys with null & undefined values
										PersistentStorage.set(me.getStateKey(), me.currentState);
										replace.call(history, me.currentState, document.title, location.href);
									}
								});
						})

						//then finish or fail
						.then(fulfill, reject);

			});

			return me.restoringState
					.then(function() {
						me.initialState = Ext.clone(me.currentState);
					})
					.fail(function(reason) {
						delete me.restoringState;
						console.error('Failed to restore state', reason);
						return Promise.reject(reason);
					});
		},


		isRestoring: function() {return !!this.restoringState;},


		getStateRestorationHandlerFor: function(key) {
			var hdlr = this.callOnAllControllersWith('getStateRestorationHandler', key);
			return hdlr || Ext.getCmp(key);
		},


		//<editor-fold desc="Getters">
		getState: function() {
			return Ext.clone(this.currentState);
		},


		//Current default state is to load the content viewer on either the nti.landing_page or the first page in the
		//library. And to put the profile on the app user.
		buildDefaultState: function() {
			var dsLandingPage = Ext.util.Cookies.get('nti.landing_page');
			return {
				active: dsLandingPage ? 'content' : 'library',
				content: { location: dsLandingPage || Library.getFirstPage() || undefined },
				profile: { username: $AppConfig.username }
			};
		},


		loadState: function() {
			if (this.isHangout) {
				console.info('Setting up state for Hangout...');
				return {};
			}

			var defaultState = this.buildDefaultState(),
				lastLocation,
				previousState,
				result;

			try {
				previousState = PersistentStorage.get(this.getStateKey());
				console.log('local state found?', previousState);
				lastLocation = previousState || null;

				if (previousState && previousState.version !== this.currentStateVersion) {
					PersistentStorage.remove(this.getStateKey());
					lastLocation = defaultState;
				}

				result = lastLocation && Ext.Object.getKeys(lastLocation).length > 0 ? lastLocation : defaultState;
				if (location.hash) {
					Ext.Object.merge(result, this.interpretFragment(location.hash));
				}

				if (location.search) {
					Ext.Object.merge(result, this.interpretQueryParams(location.search));
				}

				return result;
			}
			catch (e) {
				console.error('failed to decode local state, use default.', Globals.getError(e));
				PersistentStorage.remove(this.getStateKey());
				return defaultState;
			}
		},


		getStateKey: function() {
			var username = $AppConfig.username;
			if (!username) {
				console.error('unknown username for state mgmt.');
			}
			return B64.encode('state-' + username);
		}
		//</editor-fold>
	});

}());
