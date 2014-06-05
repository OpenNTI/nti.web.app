PREVIOUS_STATE = 'previous-state';

(function() {

	function Transaction(transactionId, stateCtlr, parentTransaction) {
		this.id = transactionId;
		this.ctlr = stateCtlr;
		this.parent = parentTransaction;
		if (this.parent) {
			this.parent.hooked = true;
		}

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
			}
		},


		getInfo: function() {
			return {
				Open: this.isOpen(),
				id: this.getId(),
				length: this.txn ? this.txn.length : null,
				parent: this.parent && this.parent.getInfo()
			};
		},


		toString: function() {
			return JSON.stringify(this.getInfo());
		},


		commit: function() {
			var state, replace = false, title = '', url = '';

			if (!this.isOpen()) {
				console.error('Attempting to commit a closed transaction.');
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


		_add: function(o) {
			this.txn.push(o);
		}
	};

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
		//</editor-fold>


		//<editor-fold desc="Init">
		constructor: function() {
			this.callParent(arguments);

			this.addEvents('restore');
			this.on('restore', this.restoreState, this);

			this.fragmentInterpreterMap = {
				'#!profile': Ext.bind(this.interpretProfileFragment, this),
				'#!forums': Ext.bind(this.interpretForumsFragment, this),
				'#!object': Ext.bind(this.interpretObjectFragment, this)
			};

			this.generateFragmentMap = {
				'forums': Ext.bind(this.generateForumsFragment, this)
			};
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
				history = window.history,
				push = (history.pushState || Ext.emptyFn),
				replace = (history.replaceState || Ext.emptyFn),
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
				Ext.applyIf(s, {active: current.active, version: 3});

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
				console.debug('Browser is popping state, new state appling: ', Ext.decode(e.state, true));
				me.onPopState(e);
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
				console.error('Transaction already open. (' + this.activeTransaction + ') ' +
						'Attempted to create a new transaction with id: ' + transactionId + '. ' +
						'Ignoring and returning the current transactoin.');
			}

			return this.activeTransaction;
		},
		//</editor-fold>


		//<editor-fold desc="Fragment Functions">
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


		generateForumsFragment: function(state) {
			var resultParts = [], result,
				board = state && state.board;

			if (board && board.isUser && board.community) {
				resultParts.push('u');
				resultParts.push(board.community);

				Ext.each(['forum', 'topic', 'comment'], function(prop) {
					if (state.hasOwnProperty(prop) && state[prop]) {
						resultParts.push(state[prop]);
					}
				});
			}

			if (!Ext.isEmpty(resultParts)) {
				result = resultParts.join('/');
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
			var domain,
				parts = (fragment || '').split('/').slice(0);

			parts = Ext.Array.clean(parts);
			console.debug('Fragment:', fragment, 'Query: ', query, 'Parts', parts);

			if ((parts[0] || '').toLowerCase() === '#!object') {
				domain = parts[1];
				parts = parts.slice(2);

				if (domain === 'ntiid' && parts.length === 1 && ParseUtils.parseNTIID(parts[0])) {
					Ext.defer(this.fireEvent, 1, this, ['show-ntiid', parts[0]]);
				}
			}
			return {};
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
				result = {active: 'content', content: {location: ntiid}};
			}

			console.debug('Fragment interpreted:', result);
			return result;
		},
		//</editor-fold>


		//<editor-fold desc="Handlers">
		onPopState: function(e) {
			if (!NextThought.isInitialized || this.isHangout) {
				return;
			}
			var s = e ? e.state : null;
			if (!s) {
				console.warn('there is no state to restore??', e);
				return;
			}
			this.fireEvent('restore', Ext.decode(s, true) || {});
		},


		track: function(viewId, silent) {
			var state = {active: viewId};

			if (!silent && this.currentState.active !== viewId && NextThought.isInitialized) {
				history.pushState(state, document.title, './');
			}
		},
		//</editor-fold>


		restoreState: function(stateObject) {
			if (this.restoringState) {
				console.warn('Restoring state while one is already restoring...');
				return;
			}
			this.restoringState = true;
			var app = this.application,
				history = window.history,
				tasks = [],
				replaceState = false, c, key, stateScoped, me = this, presentation;

			function fin(key, stateFrag) {
				var token = {};
				token[key] = stateFrag;
				app.registerInitializeTask(token);
				return function(a) {
					app.finishInitializeTask(token);
				};
			}

			function fail(stateFrag) {
				return function(reason) {
					console.error('Restore state Failed because', reason, ', fragment:', stateFrag);
				};
			}

			if (stateObject === PREVIOUS_STATE) {
				replaceState = true;
				stateObject = this.loadState();
				ObjectUtils.clean(stateObject);//drop keys with null & undefined values
				if (history.updateState) {
					history.updateState(stateObject);
				}
			}

			c = this.fireEvent('show-view', stateObject.active, true);
			// c equals false means that we got cancelled in beforedeactivate event.
			// i.e we can get cancelled if the activeView has blog editor open.
			if (c === false) {
				if (NextThought.isInitialized) {
					history.back();
				}
				this.restoringState = false;
				return;
			}

			this.currentState.active = stateObject.active;

			for (key in stateObject) {
				if (stateObject.hasOwnProperty(key) && /object/i.test(typeof(stateObject[key]))) {
					c = Ext.getCmp(key);
					if (c && c.restore) {
						try {
							stateScoped = {active: stateObject.active};
							this.currentState[key] = stateScoped[key] = stateObject[key];
							tasks.push(c.restore(stateScoped).then(fin(key, stateScoped), fail(stateScoped)));
						}
						catch (e) {
							console.error('Setting state: ', e, e.message, e.stack);
						}
					}
					else {
						console.warn('The key', key, 'did not point to a component with a restore method:', c);
					}
				}
			}


			Promise.all(tasks).always(function() {
				console.log('Finished');
				if (replaceState) {
					history.replaceState(me.currentState, 'Title');
				}

				me.restoringState = false;
			});
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

				if (!lastLocation) {
					return defaultState;
				}


				result = lastLocation && Ext.Object.getKeys(lastLocation).length > 0 ? lastLocation : defaultState;
				if (location.hash) {
					Ext.Object.merge(result, this.interpretFragment(location.hash));
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
