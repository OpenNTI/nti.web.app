PREVIOUS_STATE = 'previous-state';
BASE_STATE = { active: 'home' };

Ext.define('NextThought.controller.State', {
	extend: 'Ext.app.Controller',

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

	constructor: function () {
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

	init: function () {
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
		ContentAPIRegistry.register('NTIPreviousPage', this.navigatePreviousPage, this);
	},


	onSessionReady: function () {
		var me = this,
			history = window.history,
			push = history.pushState || function () {
			},
			replace = history.replaceState || function () {
			},
			SEVEN_DAYS = 604800000,
			p = me.getStateKey() + 'non-history-state-',
			provider = Ext.supports.LocalStorage
				? new Ext.state.LocalStorageProvider({prefix: p})
				: new Ext.state.CookieProvider({prefix: p, expires: new Date(new Date().getTime() + SEVEN_DAYS) });

		Ext.state.Manager.setProvider(provider);


		/**
		 * Update the application's state object from various actions in this controller.
		 *
		 * @param {Object} s The new state fragment, it will be merged into the current state, replacing keys it has,
		 *                      and leaving keys it does not have alone.
		 * @return {Boolean} Returns true if the state was changed, false otherwise.
		 */
		history.updateState = function (s) {
			function isDiff(a, b) {
				var ret = false;

				Ext.Object.each(b, function objItr(key, val) {
					if (!Ext.isObject(val)) {
						//Not an object do identity comparison
						if (!a || a[key] !== val) {
							ret = true;
						}
					}
					else if (isDiff(a[key], val)) { //Ok so val is an object do a deep equals
						ret = true;
					}

					return !ret;//a false value will stop the iteration, if we find a
				});
				return ret;
			}

			var current = me.currentState,
				diff = isDiff(current, s);
			console.debug('update state', arguments);
			Ext.applyIf(s, {active: current.active, version:3});

			console.debug('Will state change?', diff);

			//The only thing listening to this event is the Google Hangout controller.
			if (diff && me.fireEvent('stateChange', s)) {
				Ext.Object.merge(current, s);
				PersistentStorage.set(me.getStateKey(), current);
				return true;
			}

			return false;
		};


		history.pushState = function (s, title, url) {
			console.debug('push state', s);

			if (this.updateState(s) && !me.isPoppingHistory) {

				if (!url) {
					url = me.generateFragment(me.currentState);
				}

				if (!s || !url) {
					console.warn('Should provide both state and a url', arguments);
				}

				//updateState already updated current if it returned true
				push.apply(history, [me.currentState, title, url]);


				//me = State controller. (this = window.history) And, we only want to change the fragment if we do not
				// support history.pushState natively.
				if (!me.hasPushState && url) {
					//The intention is we only get here for IE9 so lets make sure that is the case
					if (!Ext.isIE9) {
						console.error('Why are we getting here?');
						console.trace();
					}
					me.changeHash(url);
				}
			}
		};

		history.replaceState = function (s, title, url) {
			console.debug('replace state', s);
//			console.trace();

			if (this.updateState(s)) {

				replace.apply(history, [
					me.currentState,
					title,
					url || me.generateFragment(me.currentState)
				]);
			}
		};

		window.onpopstate = function (e) {
			console.debug('Browser is popping state', e.state);

			me.isPoppingHistory = true;
			me.onPopState(e);
			me.isPoppingHistory = false;
		};

		window.onhashchange = function (e) {
			//Hash changes are their own entry in the history... so we do not need to push history, we just need to
			// handle the change.
			console.debug('Hash change');
			var newState = me.interpretFragment(location.hash);
			if (history.updateState(newState)) {
				console.debug('restoring state from hash change', newState);
				me.restoreState(newState);
				history.replaceState(me.getState(), document.title, location.toString());
			}
		};
	},


	interpretForumsFragment: function (fragment, query) {
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


	generateForumsFragment: function (state) {
		var resultParts = [], result,
			board = state && state.board;

		if (board && board.isUser && board.community) {
			resultParts.push('u');
			resultParts.push(board.community);

			Ext.Array.each(['forum', 'topic', 'comment'], function (prop) {
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


	interpretProfileFragment: function (fragment, query) {
		var result = {},
			user = this.getUserModel().getProfileStateFromFragment(fragment);
		if (user) {
			result = {
				active: 'profile',
				profile: user
			};
			result.profile.queryObject = query;
		}
		return result;
	},


	interpretObjectFragment: function (fragment, query) {
		var domain,
			parts = (fragment || '').split('/').slice(0);

		parts = Ext.Array.clean(parts);
		console.debug('Fragment:', fragment, 'Query: ', query, 'Parts', parts);

		if ((parts[0] || '').toLowerCase() === '#!object') {
			domain = parts[1];
			parts = parts.slice(2);

			if (domain === 'ntiid' && parts.length === 1 && ParseUtils.parseNtiid(parts[0])) {
				Ext.defer(this.fireEvent, 1, this, ['show-ntiid', parts[0]]);
			}
		}
		return {};
	},


	generateFragment: function (state) {
		var root = (state.active || '').toLowerCase(),
			fragment, generated;

		if (root) {
			fragment = '#!' + root;
		}

		if (this.generateFragmentMap[root]) {
			//We pass it the state for that particular tab
			generated = this.generateFragmentMap[root](state[root] || {});
			if (generated) {
				fragment = [fragment, generated].join('/');
			}
		}

		return fragment;
	},


	interpretFragment: function (fragmentStr) {
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
			result = {active: 'content', content:{location: ntiid}};
		}

		console.debug('Fragment interpreted:', result);
		return result;
	},


	getState: function () {
		return Ext.clone(this.currentState);
	},


	onPopState: function (e) {
		if (!NextThought.isInitialized || this.isHangout) {
			return;
		}
		var s = e ? e.state : null;
		if (!s) {
			console.warn('there is no state to restore??',e);
			return;
		}
		this.fireEvent('restore', s);
	},


	track: function (viewId, silent) {
		var fragment, state = {active: viewId},
			path = location.pathname;

		if (!silent && this.currentState.active !== viewId && NextThought.isInitialized) {

			try {
				fragment = Ext.getCmp(viewId).getFragment();
			}
			catch (e) {
				console.error(Globals.getError(e));
			}

			location.hash = fragment || '';
			if (fragment) {
				path = location.toString();
			}

			history.pushState(state, document.title, path);
		}
	},


	restoreState: function (stateObject) {
		if (this.restoringState) {
			console.warn('Restoring state while one is already restoring...');
			return;
		}
		this.restoringState = true;
		var app = this.application,
			history = window.history,
			replaceState = false, c, key, stateScoped, me = this, presentation;

		function fin(key, stateFrag) {
			var token = {};
			token[key] = stateFrag;
			app.registerInitializeTask(token);
			return function (a) {
				app.finishInitializeTask(token);
			};
		}

		if (stateObject === PREVIOUS_STATE) {
			replaceState = true;
			stateObject = this.loadState();
			if (history.updateState) {
				history.updateState(stateObject);
			}
		}

		c = this.fireEvent('show-view',stateObject.active,true);
		// c equals false means that we got cancelled in beforedeactivate event.
		// i.e we can get cancelled if the activeView has blog editor open.
		if (c === false) {
			if(NextThought.isInitialized){
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
						stateScoped = {active:stateObject.active};
						this.currentState[key] = stateScoped[key] = stateObject[key];
						c.on('finished-restore', fin(key, stateScoped), this, { single: true });
						c.restore(stateScoped);
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

		if (replaceState) {
			history.replaceState(this.currentState, 'Title');
		}

		this.restoringState = false;
	},

	//Current default state is to load the content viewer on either the nti.landing_page or the first page in the
	//library. And to put the profile on the app user.
	buildDefaultState: function () {
		var dsLandingPage = Ext.util.Cookies.get('nti.landing_page');
		return {
			active: dsLandingPage ? 'library' : 'profile',
			content: { location: dsLandingPage || Library.getFirstPage() || undefined },
			profile: { username: $AppConfig.username }
		};
	},

	loadState: function () {
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

			if(!lastLocation){
				return defaultState;
			}

			//migrate
			if(lastLocation.location){
				lastLocation.content = {location:lastLocation.location};
				delete lastLocation.location;
			}

			//migrate
			if(lastLocation.library && lastLocation.library.location){
				lastLocation.content = lastLocation.library;
				delete lastLocation.library;
				if(lastLocation.active==='library'){
					lastLocation.active='content';
				}
			}

			result = lastLocation && Ext.Object.getKeys(lastLocation).length > 0 ? lastLocation : defaultState;
			if (location.hash) {
				console.debug('fragment trumps state', location.hash);
				Ext.apply(result, this.interpretFragment(location.hash));
			}
			return result;
		}
		catch (e) {
			console.error('failed to decode local state, use default.', Globals.getError(e));
			PersistentStorage.remove(this.getStateKey());
			return defaultState;
		}
	},


	getStateKey: function () {
		var username = $AppConfig.username;
		if (!username) {
			console.error('unknown username for state mgmt.');
		}
		return Base64.encode('state-' + username);
	},


	navigatePreviousPage: function () {
		history.back();
		return true;
	},

	changeHash: function (hash) {
		if (!hash || hash.indexOf('#') !== 0 || window.location.hash === hash) {
			return;
		}
		console.debug('Modifying window.location.hash', hash);
		window.location.hash = hash;
	}
});
