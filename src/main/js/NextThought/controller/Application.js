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
			body = this.getBody();

		body.pushRoute = this.pushRoute.bind(this);
		body.replaceRoute = this.replaceRoute.bind(this);
		body.pushRootRoute = this.pushRoute.bind(this);
		body.replaceRootRoute = this.replaceRoute.bind(this);
		body.setTitle = this.setTitle.bind(this);

		this.handleCurrentState()
			.then(Globals.removeLoaderSplash.bind(Globals));
	},


	handleCurrentState: function() {
		var path = window.location.pathname;

		//the path will always have /app in front of it so remove it
		path = path.split('/').slice(2).join('/');

		return this.handleRoute(path);
	},


	handleRoute: function(route, precache) {
		var body = this.getBody();

		return body.handleRoute(route, precache);
	},


	__mergeTitle: function(title) {
		var rootTitle = getString('application.title-bar-prefix', 'NextThought');

		title = rootTitle + ': ' + title;

		return title;
	},


	__mergeRoute: function(route) {
		route = Globals.trimRoute(route);

		if (route) {
			route = '/app/' + route + '/';
		} else {
			route = '/app/';
		}

		return route;
	},


	__doRoute: function(fn, title, route, precache) {
		var me = this,
			body = me.getBody(),
			myTitle = me.__mergeTitle(title),
			myRoute = me.__mergeRoute(route),
			allow = body.allowNavigation();

		function finish() {
			history[fn]({}, myTitle, myRoute);
			document.title = title;
			me.handleRoute(route, precache);
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
		this.__doRoute('pushState', title, route, precache);
	},


	replaceRoute: function(title, route, precache) {
		this.__doRoute('replaceState', title, route, precache);
	},


	setTitle: function(title) {
		title = this.__mergeTitle(title);

		document.title = title;
	}
});
