Ext.define('NextThought.app.navigation.StateStore', {
	extend: 'NextThought.common.StateStore',

	updateNavBar: function(config) {
		this.fireEvent('update-nav', config);
	},

	maybeShowChatTab: function() {
		this.fireEvent('show-chat-tab');
	},


	markReturnPoint: function(route) {
		this.returnPoint = route;
	},


	getReturnPoint: function() {
		return this.returnPoint;
	}
});
