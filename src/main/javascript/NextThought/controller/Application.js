Ext.define('NextThought.controller.Application', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.cache.*',
		'NextThought.login.StateStore',
		'NextThought.login.Actions',
		'NextThought.app.Index'
	],

	init: function() {
		var me = this;

		me.LoginActions = NextThought.login.Actions.create();
		me.LoginStore = NextThought.login.StateStore.getInstance();

		window.addEventListener('popstate', function(e) {
			me.restoreState(e.state);
		});
	},


	load: function() {
		this.mon(this.LoginStore, 'login-ready', 'restoreState');

		this.LoginActions.login();
	},


	restoreState: function(state) {
		var masterView = Ext.widget('master-view');

		Globals.removeLoaderSplash();
	}
});
