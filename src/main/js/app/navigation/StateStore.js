var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');


module.exports = exports = Ext.define('NextThought.app.navigation.StateStore', {
	extend: 'NextThought.common.StateStore',

	updateNavBar: function(config) {
		this.fireEvent('update-nav', config);
	},

	maybeShowChatTab: function() {
		this.fireEvent('show-chat-tab');
	},

	fireChatNotification: function(msg) {
		this.fireEvent('chat-notify-tab', msg);
	},

	markReturnPoint: function(route) {
		this.returnPoint = route;
	},


	getReturnPoint: function() {
		return this.returnPoint;
	},


	putMessageBarItemIntoSession: function(id, cfg) {
		var stateKey = 'topMessages',
			o = TemporaryStorage.get(stateKey) || {};

		o[id] = true;
		TemporaryStorage.set(stateKey, o);
	},


	getMessageBarItemFromSession: function(id) {
		var stateKey = 'topMessages',
			o = TemporaryStorage.get(stateKey) || {};

		return o[id];
	}
});
