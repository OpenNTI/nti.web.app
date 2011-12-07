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

		var ry=0.5,rx=0.5;
        this.applyClipRect = true;
		this.callParent([Ext.apply(config,{ type: 'circle', radius: rx,
			path: Ext.draw.Draw.parsePathString(
							Ext.String.format("M0,-{1}A{0},{1},0,1,1,0,{1}A{0},{1},0,1,1,0,-{1}z",rx, ry)) })]);
	},

	getJSONType: function(){
		return 'Circle';
	},

	getShape: function(){
		return 'ellipse';
	}

});
