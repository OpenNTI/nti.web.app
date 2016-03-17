export default Ext.define('NextThought.common.state.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.login.StateStore',
		'NextThought.common.state.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.LoginStore = NextThought.login.StateStore.getInstance();
		this.StateStore = NextThought.common.state.StateStore.getInstance();

		if (this.StateStore.loaded) { return; }

		if ($AppConfig.username) {
			this.onLogin();
		} else {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var user = $AppConfig.username;

		this.StateStore.setStateKey(B64.encode($AppConfig.username));
	},


	setState: function(key, state) {
		this.StateStore.setState(key, state);
	}
});
