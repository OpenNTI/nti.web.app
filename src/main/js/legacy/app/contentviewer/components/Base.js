var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.contentviewer.components.Base', {
	extend: 'Ext.panel.Panel',

	overflowX: 'hidden',
	overflowY: 'auto',
	frame: false,
	border: false,
	defaults: {frame: false, border: false},


	getInsertionPoint: function(subElPostfix) {
		if (subElPostfix) {
			return Ext.get(this.getEl().id + '-' + subElPostfix);
		}

		return this.getTargetEl();
	//		return Ext.get(this.getEl().id+'-innerCt');
	//		return Ext.get(this.getEl().id+'-targetEl');
	},


	relayout: function() {
		this.updateLayout();
		this.fireEvent('resize');
	}
});
