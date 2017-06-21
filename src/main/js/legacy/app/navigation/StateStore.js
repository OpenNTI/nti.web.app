const Ext = require('extjs');

const {TemporaryStorage} = require('legacy/cache/AbstractStorage');
require('legacy/common/StateStore');


module.exports = exports = Ext.define('NextThought.app.navigation.StateStore', {
	extend: 'NextThought.common.StateStore',

	updateNavBar: function (config) {
		this.fireEvent('update-nav', config);
	},

	maybeShowChatTab: function () {
		this.fireEvent('show-chat-tab');
	},

	fireChatNotification: function (msg) {
		this.fireEvent('chat-notify-tab', msg);
	},

	markReturnPoint: function (route) {
		this.returnPoint = route;
	},


	getReturnPoint: function () {
		return this.returnPoint;
	},


	putMessageBarItemIntoSession: function (id/*, cfg*/) {
		const stateKey = 'topMessages';
		let o = TemporaryStorage.get(stateKey) || {};

		o[id] = true;
		TemporaryStorage.set(stateKey, o);
	},


	getMessageBarItemFromSession: function (id) {
		let stateKey = 'topMessages';
		let o = TemporaryStorage.get(stateKey) || {};

		return o[id];
	}
});
