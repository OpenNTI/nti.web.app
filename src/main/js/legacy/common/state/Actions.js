const Ext = require('@nti/extjs');

const B64 = require('legacy/util/Base64');
const LoginStateStore = require('legacy/login/StateStore');

const StateStateStore = require('./StateStore');

require('../Actions');


module.exports = exports = Ext.define('NextThought.common.state.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.LoginStore = LoginStateStore.getInstance();
		this.StateStore = StateStateStore.getInstance();

		if (this.StateStore.loaded) { return; }

		if ($AppConfig.username) {
			this.onLogin();
		} else {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},

	onLogin: function () {
		this.StateStore.setStateKey(B64.encode($AppConfig.username));
	},

	setState: function (key, state) {
		this.StateStore.setState(key, state);
	}
});
