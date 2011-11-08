Ext.define('NextThought.view.widgets.draw.RotaterNib', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-rotater-nib',

	constructor: function(config){

		var c,i,
			p = [
			['M', .25, 1],
			['l', -.2,-.3],
			['h', .125],
			['q', -.02,-.55,  .525,-.525],
			['v', -.125],
			['l', .3,.2],
			['l', -.3,.2],
			['v', -.125],
			['q', -.4,-.02,  -.375,.375],
			['h', .125],
			['z']
		];

		for(c in p){
			for(i=1; i<p[c].length;i++)
				p[c][i] *= config.nibSize;
		}

		this.callParent([Ext.apply({
			draggable: true,
			type: 'path',
			path: p,
			fill: '#cccccc',
			stroke: '#0000ff',
			'stroke-width': 1,
			group: 'rotate'
		},config)]);

		this.id = Ext.id(null, 'nti-sprite-rotater-nib-');
	},

	isNib: true
});
