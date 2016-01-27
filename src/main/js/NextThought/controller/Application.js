import LoginStore from '../login/StateStore';
import LoginActions from '../login/Actions';
import Index from '../app/Index';
import LibraryActions from '../app/library/Actions';
import StoreActions from '../app/store/Actions';
import ChatActions from '../app/chat/Actions';
import GroupActions from '../app/group/Actions';
import ContextStore from '../app/context/StateStore';
import NotificationActions from '../app/notifications/Actions';
import StateActions from '../common/State/Actions';
import UserActions from '../app/profiles/user/Actions';
import Globals from '../util/Globals';

export default Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',

	refs: [
		{ref: 'body', selector: 'main-views'},
		{ref: 'nav', selector: 'main-navigation'}
	],


	FRAG_ROUTE: /^#!/,
	OBJECT_FRAG_ROUTE: /^#!object\/ntiid/i,
	LIBRARY_FRAG_ROUTE: /^#!library/i,
	NOTIFICATIONS_FRAG_ROUTE: /^#!profile\/[^\\]+\/Notifications/i,
	HTML_FRAG_ROUTE: /^#!HTML\//i,

	MARK_ROUTE: [
		/^course\/.*\/video.*$/,
		/^search/,
		/^notifications/,
		/^user/,
		/^group/,
		/^community/,
		/^contacts/,
		/^id/
	],

	init: function() {
		var me = this;

		me.LoginActions = LoginActions.create();
		me.LoginStore = LoginStore.getInstance();

		//create the actions that need to do something on login
		me.LibraryActions = LibraryActions.create();
		me.StoreActions = StoreActions.create();
		me.StateActions = StateActions.create();
		me.ChatActions = ChatActions.create();
		me.GroupActions = GroupsActions.create();
		me.ContextStore = ContextStateStore.getInstance();
		me.NotificationActions = NotificationsActions.create();
		me.NavigationActions = NavigationActions.create();
		me.UserProfileActions = UserActions.create();

		window.addEventListener('popstate', function(e) {
			me.handleCurrentState();
		});
	},


	load: function() {
		if(window.NextThought){
			window.NextThought.isInitialized = true;
		}
		this.mon(this.LoginStore, 'login-ready', 'onLogin');

		this.LoginActions.login();
	},


	onLogin: function() {
		var masterView = Ext.widget('master-view'),
			nav = this.getNav(),
			body = this.getBody();

		this.loggedIn = true;

		body.pushRoute = this.pushRoute.bind(this);
		body.replaceRoute = this.replaceRoute.bind(this);
		body.pushRootRoute = this.pushRoute.bind(this);
		body.replaceRootRoute = this.replaceRoute.bind(this);
		body.pushRouteState = this.pushRouteState.bind(this);
		body.replaceRouteState = this.replaceRouteState.bind(this);
		body.setTitle = this.setTitle.bind(this);

		nav.pushRootRoute = body.pushRoute.bind(body);
		nav.navigateToObject = body.navigateToObject.bind(body);
		nav.attemptToNavigateToObject = body.attemptToNavigateToObject.bind(body);

		NextThought.app.navigation.Actions.doPushRootRoute = body.pushRootRoute.bind(body);
		NextThought.app.navigation.Actions.doReplaceRootRoute = body.replaceRootRoute.bind(body);

		this.handleCurrentState()
			.then(Globals.removeLoaderSplash.bind(Globals));
	},


	handleCurrentState: function() {
		var path = Globals.trimRoute(window.location.pathname),
			hash = window.location.hash,
			parts = path.split('/');

		//Don't handle the state until we are logged in
		if (!this.loggedIn) { return; }

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


	handleFragmentRoute: function(fragment) {
		var path = '',
			parts = fragment.split('/'),
			subRoute = '',
			id, state, hash;

		if (this.OBJECT_FRAG_ROUTE.test(fragment)) {
			id = parts.last();
			id = decodeURIComponent(id);
			path = '/id/';
		} else if (this.LIBRARY_FRAG_ROUTE.test(fragment)) {
			id = parts[2];//#!library, available courses, id
			id = B64.decodeURLFriendly(id);
			path = '/library/courses/available/';

			if (parts[3] === 'redeem') {
				subRoute = 'redeem/' + parts[4];
			} else if (parts[3] === 'forcredit') {
				subRoute = 'forcredit';
			}

		} else if (this.NOTIFICATIONS_FRAG_ROUTE.test(fragment)) {
			path = '/notifications';
		} else if (this.HTML_FRAG_ROUTE.test(fragment)) {
			path = '/id/';
			id = ParseUtils.parseNtiFragment(fragment);
		} else {
			console.error('Fragement route we dont know how to handle.', fragment);
		}

		if (id) {
			id = id.split('#');
			hash = id[1];
			id[0] = ParseUtils.encodeForURI(id[0]);
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

	__shouldMark: function(route) {
		if (!route) { return false; }

		var shouldMark = false;

		route = Globals.trimRoute(route);

		this.MARK_ROUTE.forEach(function(regex) {
			shouldMark = shouldMark || regex.test(route);
		});

		return shouldMark;
	},


	maybeMarkReturn: function(title, route) {
		var nav = this.NavigationActions,
			newRouteShouldMark = this.__shouldMark(route),
			oldRouteShouldMark = this.__shouldMark(this.currentRoute);

		if (newRouteShouldMark && !oldRouteShouldMark) {
			nav.markReturnPoint(this.currentRoute);
		}
	},


	handleRoute: function(title, route, precache) {
		var me = this, location;

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

				body.beforeRouteChange();

				body.handleRoute(r, p)
					.then(fulfill, reject);
			});
		}

		location = Globals.getURLParts('/' + route.replace(/^\//, ''));

		//since its an absolute path the path name will start
		//with a / so there will be an empty space at the end of the string
		//so use that when we join to keep the path absolute
		parts = location.pathname.split('/');


		//if we are navigating to an object remove it from the path
		//so any handlers that have a variable at the end won't accidentally
		//get 'object'
		//object/mimeType/id
		// if (parts[parts.length - 3] === 'object') {
		// 	location.pathname = parts.slice(0, -3).join('/');
		// //object/id
		// } else if (parts[parts.length - 2] === 'object') {
		// 	location.pathname = parts.slice(0, -2).join('/');
		// }

		this.maybeMarkReturn(title, location.pathname);

		this.currentRoute = location.pathname + (location.search || '') + (location.hash || '');

		return handleRoute(this.currentRoute, precache)
			.then(this.onRoute.bind(this, title, route));
	},


	onRoute: function(title, route) {
		var body = this.getBody(),
			store = this.ContextStore;

		//if we set the route with a fragement it get passed in here
		//so make sure we split it off
		route = route.split('#')[0];

		body.getCurrentContext()
			.then(function(context) {
				store.setContext(context, title || document.title, route);
			});
	},


	__mergeTitle: function(title) {
		var rootTitle = getString('application.title-bar-prefix', 'NextThought');

		title = rootTitle + ': ' + title;

		return title;
	},


	__mergeRoute: function(route) {
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


	__doRoute: function(fn, state, title, route, precache) {
		var me = this,
			body = me.getBody(),
			myTitle = me.__mergeTitle(title),
			myRoute = me.__mergeRoute(route),
			allow = body.allowNavigation();

		function finish() {
			history[fn](state || history.state, myTitle, myRoute);
			document.title = title;
			me.handleRoute(title, route, precache);
		}

		function stopNav() {
			console.warn('NAVIGATION STOPPED:', title, route);
		}

		if (allow instanceof Promise) {
			allow
				.then(finish)
				.fail(stopNav);
		} else if (allow === false) {
			stopNav();
		} else {
			finish();
		}
	},


	pushRoute: function(title, route, precache) {
		this.__doRoute('pushState', null, title, route, precache);
	},


	replaceRoute: function(title, route, precache, fragment) {
		this.__doRoute('replaceState', null, title, route, precache);
	},


	pushRouteState: function(state, title, route, precache, fragment) {
		var body = this.getBody(),
			historyState = {};

		historyState[body.state_key] = state;

		this.__doRoute('pushState', historyState, title, route, precache);
	},


	replaceRouteState: function(state, title, route, precache, fragment) {
		var body = this.getBody(),
			historyState = {};

		historyState[body.state_key] = state;

		this.__doRoute('replaceState', historyState, title, route, precache);
	},


	setTitle: function(title) {
		title = this.__mergeTitle(title);

		document.title = title;

		this.ContextStore.setCurrentTitle(title);
	}
});
