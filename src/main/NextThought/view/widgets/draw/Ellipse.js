Ext.define('NextThought.view.widgets.draw.Ellipse', {
	extend: 'NextThought.view.widgets.draw.Shape',
	alias: 'widget.sprite-ellipse',

//	type: 'ellipse',
//
//	cx:"280.306",//center point
//	cy:"206.47",//center point
//
//	rx:"87.755",//horizontal radius
//	ry:"47.959",//vertical radius

	constructor: function(config){

		this.callParent([Ext.apply(config,{ type: 'circle' })]);
	},

	getShape: function(){
		return 'ellipse';
	}
});
