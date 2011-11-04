Ext.define('NextThought.view.widgets.draw.Shape', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-base',

	constructor: function(config){
		this.callParent([Ext.apply(config,{ draggable: true, x:0, y:0, width: 1, height: 1 })]);
		this.on('render', function(s){
			s.el.dom.setAttribute('vector-effect','non-scaling-stroke');
		});
		//for some strange reason, even though we tell the browser not to scale the stroke, it still makes the bonding
		// clickible element the size of the shape as if it did scale the stroke... so we Clip it. (the clip gets scaled
		// too.
		this.setAttributes({'clip-rect': {x:-0.55, y:-0.55, width: 1.1, height: 1.1}});
	},

	getShape: function(){
		return this.type;
	},

	inBBox: function(xy){
		var b = this.getBBox(), x=xy[0], y=xy[1];

		return (b.x <= x && (b.x+b.width) >=x )
			&& (b.y <= y && (b.y+b.height) >= y);
	}
});
