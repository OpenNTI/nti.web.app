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
			me.restoreState(e.state);
		});
	},


	load: function() {
		this.mon(this.LoginStore, 'login-ready', 'restoreState');

		this.LoginActions.login();
	},


	restoreState: function(state) {
		var masterView = Ext.widget('master-view'),
			body = this.getBody(), nav = this.getNav(),
			path = window.location.pathname;

		//the path will always have /app in front of it so remove it
		path = path.split('/').slice(2).join('/');

		body.handleRoute(path)
			.then(Globals.removeLoaderSplash.bind(Globals));
	}
});
