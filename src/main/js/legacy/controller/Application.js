const Ext = require('@nti/extjs');
const { encodeForURI, isNTIID } = require('@nti/lib-ntiids');
const { wait } = require('@nti/lib-commons');
const { getHistory } = require('@nti/web-routing');
const { default: Logger } = require('@nti/util-logger');
const { getString } = require('internal/legacy/util/Localization');
const B64 = require('internal/legacy/util/Base64');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const LoginStore = require('internal/legacy/login/StateStore');
const LoginActions = require('internal/legacy/login/Actions');
const LibraryActions = require('internal/legacy/app/library/Actions');
const StoreActions = require('internal/legacy/app/store/Actions');
const ChatActions = require('internal/legacy/app/chat/Actions');
const GroupActions = require('internal/legacy/app/groups/Actions');
const ContextStore = require('internal/legacy/app/context/StateStore');
const StateActions = require('internal/legacy/common/state/Actions');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const UserDataActions = require('internal/legacy/app/userdata/Actions');

require('internal/legacy/app/Index');

const logger = Logger.get('app');
const routeHistory = getHistory();

module.exports = exports = Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',

	refs: [
		{ ref: 'body', selector: 'main-views' },
		{ ref: 'nav', selector: 'main-navigation' },
	],

	FRAG_ROUTE: /^#!/,
	OBJECT_FRAG_ROUTE: /^#!object\/ntiid/i,
	LIBRARY_FRAG_ROUTE: /^#!library/i,
	NOTIFICATIONS_FRAG_ROUTE: /^#!profile\/[^\\]+\/Notifications/i,
	HTML_FRAG_ROUTE: /^#!HTML\//i,

	MARK_ROUTE: [
		/^course\/.*\/video.*$/,
		/^course\/.*\/viewer.*$/,
		/^search/,
		/^notifications/,
		/^user/,
		/^group/,
		/^community/,
		/^contacts/,
		/^id/,
	],

	init: function () {
		var me = this;

		me.LoginActions = LoginActions.create();
		me.LoginStore = LoginStore.getInstance();

		//create the actions that need to do something on login
		me.LibraryActions = LibraryActions.create();
		me.StoreActions = StoreActions.create();
		me.StateActions = StateActions.create();
		me.ChatActions = ChatActions.create();
		me.GroupActions = GroupActions.create();
		me.ContextStore = ContextStore.getInstance();
		me.NavigationActions = NavigationActions.create();
		me.UserDataActions = UserDataActions.create();

		// window.addEventListener('popstate', function (e) {
		// 	me.handleCurrentState();
		// });

		routeHistory.listen(this.maybeSyncToHistory.bind(this));
	},

	load: function () {
		if (window.NextThought) {
			window.NextThought.isInitialized = true;
		}
		this.mon(this.LoginStore, 'login-ready', 'onLogin');

		this.LoginActions.login();
	},

	onLogin: function () {
		Ext.widget('master-view');
		const nav = this.getNav();
		const body = this.getBody();

		this.loggedIn = true;

		body.pushRoute = this.pushRoute.bind(this);
		body.pushRouteKeepScroll = this.pushRouteKeepScroll.bind(this);
		body.replaceRoute = this.replaceRoute.bind(this);
		body.pushRootRoute = this.pushRoute.bind(this);
		body.replaceRootRoute = this.replaceRoute.bind(this);
		body.pushRouteState = this.pushRouteState.bind(this);
		body.replaceRouteState = this.replaceRouteState.bind(this);
		body.setTitle = this.setTitle.bind(this);

		nav.pushRootRoute = body.pushRoute.bind(body);
		nav.navigateToObject = body.navigateToObject.bind(body);
		nav.attemptToNavigateToObject =
			body.attemptToNavigateToObject.bind(body);

		NavigationActions.doPushRootRoute = body.pushRootRoute.bind(body);
		NavigationActions.doReplaceRootRoute = body.replaceRootRoute.bind(body);

		this.handleCurrentState().then(
			Globals.removeLoaderSplash.bind(Globals)
		);
	},

	maybeSyncToHistory() {
		if (!this.currentMyRoute) {
			return;
		}

		const { pathname } = routeHistory.location;
		const currentPathname = decodeURI(
			Globals.getURLParts(this.currentMyRoute).pathname
		);
		const pendingPathname = this.pendingRoute
			? decodeURI(Globals.getURLParts(this.pendingRoute).pathname)
			: '';

		//if the history changes to a new path that doesn't match our current route, handle it
		if (
			Globals.trimRoute(pathname) !==
				Globals.trimRoute(currentPathname) &&
			Globals.trimRoute(pathname) !== Globals.trimRoute(pendingPathname)
		) {
			this.handleCurrentState();
		}
	},

	handleCurrentState: function () {
		var path = Globals.trimRoute(window.location.pathname),
			hash = window.location.hash,
			parts = path.split('/');

		//Don't handle the state until we are logged in
		if (!this.loggedIn) {
			return;
		}

		this.currentMyRoute = path;

		//Get the first part of the path and use that as the path root for all the routes
		this.APP_ROOT = parts[0];

		path = parts.slice(1).join('/');

		if (hash && this.FRAG_ROUTE.test(hash)) {
			return this.handleFragmentRoute(hash);
		}

		if (window.location.search) {
			path += window.location.search;
		}

		if (hash) {
			path += hash;
		}

		return this.handleRoute(document.title, path);
	},

	handleFragmentRoute: function (fragment) {
		var path = '',
			parts = fragment.split('/'),
			subRoute = '',
			id,
			hash;

		if (this.OBJECT_FRAG_ROUTE.test(fragment)) {
			id = parts.last();
			id = decodeURIComponent(id);
			path = '/id/';
		} else if (this.LIBRARY_FRAG_ROUTE.test(fragment)) {
			id = parts[2]; //#!library, available courses, id
			id = B64.decodeURLFriendly(id);
			path = '/catalog/object/';

			if (parts[3] === 'redeem') {
				subRoute = 'redeem/' + parts[4];
			} else if (parts[3] === 'forcredit') {
				subRoute = 'forcredit';
			}
		} else if (this.NOTIFICATIONS_FRAG_ROUTE.test(fragment)) {
			path = '/notifications';
		} else if (this.HTML_FRAG_ROUTE.test(fragment)) {
			path = '/id/';
			id = lazy.ParseUtils.parseNtiFragment(fragment);
		} else {
			logger.error(
				'Fragement route we dont know how to handle.',
				fragment
			);
		}

		if (id) {
			id = id.split('#');
			hash = id[1];
			id[0] = isNTIID(id[0])
				? encodeForURI(id[0])
				: encodeURIComponent(id[0]);
			path += id[0];
		}

		if (subRoute) {
			path = Globals.trimRoute(path) + '/' + Globals.trimRoute(subRoute);
		}

		if (hash) {
			path = Globals.trimRoute(path) + '#' + hash;
		}

		return this.handleRoute(document.title, path);
	},

	__shouldMark: function (route) {
		if (!route) {
			return false;
		}

		var shouldMark = false;

		route = Globals.trimRoute(route);

		this.MARK_ROUTE.forEach(function (regex) {
			shouldMark = shouldMark || regex.test(route);
		});

		return shouldMark;
	},

	maybeMarkReturn: function (title, route) {
		var nav = this.NavigationActions,
			newRouteShouldMark = this.__shouldMark(route),
			oldRouteShouldMark = this.__shouldMark(this.currentRoute);

		if (newRouteShouldMark && !oldRouteShouldMark) {
			nav.markReturnPoint(this.currentRoute);
		}
	},

	sendGAEvent() {
		if (!global.ga) {
			logger.debug(
				'Router requires ga to be available in global scope. Aborting attempt to send google analytics navigation event'
			);
			return;
		}
		global.ga(
			'set',
			'page',
			global.location.href.replace(global.location.origin, '')
		);
		global.ga('send', 'pageview');
	},

	handleRoute: function (title, route, precache, afterRoute) {
		var me = this,
			location;

		function handleRoute(r, p) {
			var tries = 0;

			return new Promise(function handle(fulfill, reject) {
				var body = me.getBody();

				tries += 1;

				if (!body && tries > 30) {
					return reject();
				}

				if (!body) {
					wait(100).then(handle);
					return;
				}

				if (body.isRouteDifferent(r)) {
					body.beforeRouteChange(r);
				}

				body.handleRoute(r, p).then(fulfill, reject);
			});
		}

		location = Globals.getURLParts('/' + route.replace(/^\//, ''));

		//since its an absolute path the path name will start
		//with a / so there will be an empty space at the end of the string
		//so use that when we join to keep the path absolute
		// const parts = location.pathname.split('/');

		//if we are navigating to an object remove it from the path
		//so any handlers that have a variable at the end won't accidentally
		//get 'object'
		//object/mimeType/id
		// if (parts[parts.length - 3] === 'object') {
		//	location.pathname = parts.slice(0, -3).join('/');
		// //object/id
		// } else if (parts[parts.length - 2] === 'object') {
		//	location.pathname = parts.slice(0, -2).join('/');
		// }

		this.maybeMarkReturn(title, location.pathname);

		this.currentRoute =
			location.pathname + (location.search || '') + (location.hash || '');

		return handleRoute(this.currentRoute, precache).then(
			this.onRoute.bind(this, title, route, afterRoute)
		);
	},

	async onRoute(title, route, afterRoute) {
		const body = this.getBody();

		//if we set the route with a fragement it get passed in here
		//so make sure we split it off
		route = route.split('#')[0];

		const context = await body.getCurrentContext();
		this.ContextStore.setContext(context, title || document.title, route);

		this.sendGAEvent();

		if (afterRoute) {
			afterRoute();
		}
	},

	__mergeTitle: function (title) {
		var rootTitle = getString(
			'application.title-bar-prefix',
			'NextThought'
		);

		title = rootTitle + ': ' + title;

		return title;
	},

	__mergeRoute: function (route) {
		var location = Globals.getURLParts(route),
			pathname;

		route = Globals.trimRoute(location.pathname);

		if (route) {
			location.pathname = '/' + this.APP_ROOT + '/' + route;
		} else {
			location.pathname = '/' + this.APP_ROOT;
		}

		pathname = Globals.trimRoute(location.pathname);

		pathname = '/' + pathname + '/';

		if (location.search) {
			pathname += location.search;
		}

		if (location.hash) {
			pathname += location.hash;
		}

		return pathname;
	},

	__doRoute: function (fn, state, title, route, precache, afterRoute) {
		var me = this,
			body = me.getBody(),
			myTitle = me.__mergeTitle(title),
			myRoute = me.__mergeRoute(route),
			allow = body.allowNavigation();

		function finish() {
			me.pendingRoute = myRoute;

			const remove = routeHistory.listen((_, action) => {
				if (me.pendingRoute !== myRoute) {
					return;
				}
				if (fn === 'push' && action !== 'PUSH') {
					return;
				}
				if (fn === 'replace' && action !== 'REPLACE') {
					return;
				}

				me.currentMyRoute = myRoute;
				delete me.pendingRoute;

				//Yuck!^2 The history library doesn't allow us to set the title
				//so immediately replace the current state with one with the title
				//also the history library is decodeURIing the so for a uri encoded
				//uri part we still need to replaceState to make sure that encoding is correct
				window.history.replaceState(
					window.history.state,
					myTitle,
					myRoute
				);
				// history[fn](state || window.history.state, myTitle, myRoute);
				document.title = title;

				me.handleRoute(title, route, precache, afterRoute);

				remove();
			});

			routeHistory[fn](
				myRoute,
				state ||
					(window.history.state && window.history.state.state) ||
					window.history.state
			);
		}

		function stopNav() {
			logger.warn('NAVIGATION STOPPED:', title, route);
		}

		if (allow instanceof Promise) {
			allow.then(finish).catch(stopNav);
		} else if (allow === false) {
			stopNav();
		} else {
			finish();
		}
	},

	pushRoute: function (title, route, precache) {
		this.__doRoute('push', null, title, route, precache, () => {
			window.scroll(0, 0);
		});
	},

	pushRouteKeepScroll: function (title, route, precache) {
		this.__doRoute('push', null, title, route, precache);
	},

	replaceRoute: function (title, route, precache, fragment) {
		this.__doRoute('replace', null, title, route, precache);
	},

	pushRouteState: function (state, title, route, precache, fragment) {
		var body = this.getBody(),
			historyState = {};

		historyState[body.stateKey] = state;

		this.__doRoute('push', historyState, title, route, precache);
	},

	replaceRouteState: function (state, title, route, precache, fragment) {
		var body = this.getBody(),
			historyState = {};

		historyState[body.stateKey] = state;

		this.__doRoute('replace', historyState, title, route, precache);
	},

	setTitle: function (title) {
		title = this.__mergeTitle(title);

		document.title = title;

		this.ContextStore.setCurrentTitle(title);
	},
});
