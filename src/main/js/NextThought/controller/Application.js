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


	handleRoute: function(route) {
		var body = this.getBody();

		return body.handleRoute(route);
	},


	__mergeTitle: function(title) {
		var rootTitle = getString('application.title-bar-prefix', 'NextThought');

		title = rootTitle + ': ' + title;

		return title;
	},


	__mergeRoute: function(route) {
		route = Globals.trimRoute(route);
		route = '/app/' + route + '/';

		return route;
	},


	pushRoute: function(title, route) {
		title = this.__mergeTitle(title);
		route = this.__mergeRoute(route);

		history.pushState({}, title, route);
		document.title = title;
		this.handleRoute(route);
	},


	replaceRoute: function(title, route) {
		title = this.__mergeTitle(title);
		route = this.__mergeRoute(route);

		history.replaceState({}, title, route);
		document.title = title;
		this.handleRoute(route);
	},


	setTitle: function(title) {
		title = this.__mergeTitle(title);

		document.title = title;
	}
});
