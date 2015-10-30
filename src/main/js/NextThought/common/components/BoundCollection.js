Ext.define('NextThought.common.components.BoundCollection', {
	extend: 'Ext.container.Container',

	cacheItems: function(item) {},


	loadCollection: function(url) {
		var me = this;

		me.activeUrl = url;
	},


	refresh: function() {

	}
});
