Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.cache.*',
		'NextThought.login.StateStore',
		'NextThought.login.Actions',
		'NextThought.app.Index',
		//require actions that need to do something on login
		'NextThought.app.library.Actions',
		'NextThought.app.store.Actions',
		'NextThought.app.chat.Actions',
		'NextThought.app.groups.Actions',
		'NextThought.app.context.StateStore',
		'NextThought.app.notifications.Actions',
		'NextThought.common.state.Actions'
	],

	refs: [
		{ref: 'body', selector: 'main-views'},
		{ref: 'nav', selector: 'main-navigation'}
	],

	init: function() {
		var me = this;

		me.LoginActions = NextThought.login.Actions.create();
		me.LoginStore = NextThought.login.StateStore.getInstance();

		//create the actions that need to do something on login
		me.LibraryActions = NextThought.app.library.Actions.create();
		me.StoreActions = NextThought.app.store.Actions.create();
		me.StateActions = NextThought.common.state.Actions.create();
		me.ChatActions = NextThought.app.chat.Actions.create();
		me.GroupActions = NextThought.app.groups.Actions.create();
		me.ContextStore = NextThought.app.context.StateStore.getInstance();
		me.NotificationActions = NextThought.app.notifications.Actions.create();

		window.addEventListener('popstate', function(e) {
			me.handleCurrentState();
		});
	},


	load: function() {
		this.mon(this.LoginStore, 'login-ready', 'onLogin');

		this.LoginActions.login();
	},


	onLogin: function() {
		var masterView = Ext.widget('master-view'),
			nav = this.getNav(),
			body = this.getBody();

		body.pushRoute = this.pushRoute.bind(this);
		body.replaceRoute = this.replaceRoute.bind(this);
		body.pushRootRoute = this.pushRoute.bind(this);
		nav.pushRootRoute = this.pushRoute.bind(this);
		body.replaceRootRoute = this.replaceRoute.bind(this);
		body.pushRouteState = this.pushRouteState.bind(this);
		body.replaceRouteState = this.replaceRouteState.bind(this);
		body.setTitle = this.setTitle.bind(this);

		this.handleCurrentState()
			.then(Globals.removeLoaderSplash.bind(Globals));
	},


	handleCurrentState: function() {
		var path = Globals.trimRoute(window.location.pathname),
			parts = path.split('/');

		//Get the first part of the path and use that as the path root for all the routes
		this.APP_ROOT = parts[0];

		path = parts.slice(1).join('/');

		return this.handleRoute(document.title, path);
	},


	handleRoute: function(title, route, precache) {
		var body = this.getBody();

		return body.handleRoute(route, precache)
			.then(this.onRoute.bind(this, title, route));
	},


	onRoute: function(title, route) {
		var body = this.getBody(),
			store = this.ContextStore;

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
		route = Globals.trimRoute(route);

		if (route) {
			route = '/' + this.APP_ROOT + '/' + route + '/';
		} else {
			route = '/' + this.APP_ROOT + '/';
		}

		return route;
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


	replaceRoute: function(title, route, precache) {
		this.__doRoute('replaceState', null, title, route, precache);
	},


	pushRouteState: function(state, title, route, precache) {
		var body = this.getBody(),
			historyState = {};

		historyState[body.state_key] = state;

		this.__doRoute('pushState', historyState, title, route, precache);
	},


	replaceRouteState: function(state, title, route, precache) {
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
