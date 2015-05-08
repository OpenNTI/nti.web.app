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


	pushRoute: function(title, route, precache) {
		var myTitle = this.__mergeTitle(title),
			myRoute = this.__mergeRoute(route);

		history.pushState({}, myTitle, myRoute);
		document.title = title;
		this.handleRoute(route, precache);
	},


	replaceRoute: function(title, route, precache) {
		var myTitle = this.__mergeTitle(title),
			myRoute = this.__mergeRoute(route);

		history.replaceState({}, myTitle, myRoute);
		document.title = title;
		this.handleRoute(route, precache);
	},


	setTitle: function(title) {
		title = this.__mergeTitle(title);

		document.title = title;
	}
});
