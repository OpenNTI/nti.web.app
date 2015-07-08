Ext.define('NextThought.app.navigation.StateStore', {
	extend: 'NextThought.common.StateStore',

	updateNavBar: function(config) {
		this.fireEvent('update-nav', config);
	},


	markReturnPoint: function(route) {
		this.returnPoint = route;
	},


	getReturnPoint: function() {
		return this.returnPoint;
	}
});
