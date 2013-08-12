Ext.define('NextThought.layout.component.Natural', {
	extend: 'Ext.layout.component.Body',
	alias: 'layout.natural',
	type: 'natural',


//	beginLayout: function (ownerContext) {
//        this.callParent(arguments);
//		if(!ownerContext.bodyContext){
//			ownerContext.bodyContext = ownerContext.getEl('el');
//		}
//    },


	publishInnerWidth: function(ownerContext, width){
//		return ownerContext.bodyContext.setWidth(width, false);
		return ownerContext.setWidth(width, false);
	},


	publishInnerHeight: function (ownerContext, height) {
//		return ownerContext.bodyContext.setHeight(height, false);
		return ownerContext.setHeight(height, false);
	}
});
