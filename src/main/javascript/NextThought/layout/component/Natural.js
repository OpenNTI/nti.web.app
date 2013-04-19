Ext.define('NextThought.layout.component.Natural', {
	extend: 'Ext.layout.component.Body',
	alias: 'layout.natural',
	type: 'natural',


	publishInnerWidth: function(ownerContext, width){
		return ownerContext.bodyContext.setWidth(width, false);
	},


	publishInnerHeight: function (ownerContext, height) {
		return ownerContext.bodyContext.setHeight(height, false);
	}
});
