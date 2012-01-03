Ext.define('NextThought.view.widgets.draw.RotaterNib', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-rotater-nib',

	constructor: function(config){

//		var c,i,
//			p = [
//				['m', 0.25, 1],
//				['l', -0.2,-0.3],
//				['h', 0.125],
//				['q', -0.02,-0.55,  0.525,-0.525],
//				['v', -0.125],
//				['l', 0.3,0.2],
//				['l', -0.3,0.2],
//				['v', -0.125],
//				['q', -0.4,-0.02,  -0.375,0.375],
//				['h', 0.125],
//				['z']
//			];
//
//		for(c in p){
//			if(!p.hasOwnProperty(c))continue;
//			for(i=1; i<p[c].length;i++)
//				p[c][i] *= config.nibSize;
//		}
//
//		this.callParent([Ext.apply({
//			draggable: true,
//			type: 'path',
//			path: p,
//			fill: '#cccccc',
//			stroke: '#0000ff',
//			'stroke-width': 2,
//			group: 'rotate'
//		},config)]);
		this.callParent([Ext.apply({
			draggable: true,
			type: 'circle',
			radius: config.nibSize/2,
			width: config.nibSize,
			height: config.nibSize,
			fill: '#cccccc',
			stroke: '#0000ff',
			'stroke-width': 1.5,
			group: 'resize'
		},config)]);

		this.id = Ext.id(null, 'nti-sprite-rotater-nib-');
	},

	isNib: true
});
