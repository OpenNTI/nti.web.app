Ext.define('NextThought.layout.component.Natural', {
	extend: 'Ext.layout.component.Body',
	alias:  'layout.natural',
	type:   'natural',


	beginLayout: function (ownerContext) {
		this.callParent(arguments);
		if (!ownerContext.bodyContext) {
			try {
				ownerContext.bodyContext = ownerContext.getEl('el');
			} catch (e) {
				ownerContext.bodyContent = null;
			}
		}
	},


	publishInnerWidth: function (ownerContext, width) {
		return (ownerContext.bodyContext || ownerContext).setWidth(width, false);
	},


	publishInnerHeight: function (ownerContext, height) {
		return (ownerContext.bodyContext || ownerContext).setHeight(height, false);
	}
});
