Ext.define('NextThought.view.widgets.draw.ResizerNib', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-resizer-nib',

	constructor: function(config){
		this.callParent([Ext.apply({
			draggable: true,
			type: 'rect',
			width: config.nibSize,
			height: config.nibSize,
			fill: '#cccccc',
			stroke: '#0000ff',
			'stroke-width': 1,
			group: 'resize'
		},config)]);

		this.id = Ext.id(null, 'nti-sprite-resizer-nib-');
	},

	isNib: true
});
