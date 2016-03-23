var Ext = require('extjs');
var B64 = require('../../util/Base64');
var CommonActions = require('../Actions');
var LoginStateStore = require('../../login/StateStore');
var StateStateStore = require('./StateStore');


module.exports = exports = Ext.define('NextThought.common.state.Actions', {
	extend: 'NextThought.common.Actions',

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
