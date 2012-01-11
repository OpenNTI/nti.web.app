Ext.define('NextThought.view.widgets.draw.Shape', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-base',

	requires: [
		'NextThought.util.Color'
	],

	constructor: function(config){
		var c = {
			draggable: true, x:0, y:0, width: 1, height: 1
		};
		if (config.scale) {
		 //   console.log('stroke-width changing from', config['stroke-width'], 'to',  config['stroke-width'] / ((config.scale.x + config.scale.y)/2), printStackTrace().join('\n'));
			c['stroke-width'] = config['stroke-width'] / ((config.scale.x + config.scale.y)/2)
		}

		this.callParent([Ext.apply(config,c)]);
	},


	destroy: function(){
		if(this.clip){
			Ext.get(this.clip).parent().remove();
		}

		this.callParent(arguments);
	},


	getJSONType: function(){
		return Ext.String.capitalize(this.getShape().toLowerCase());
	},


	getShape: function(){
		return this.type;
	},


	toJSON: function(){
		var m = this.matrix,
			spl = m.split(),
			sf = (spl.scaleX + spl.scaleY) / 2,
			osw = this.attr['stroke-width'],
			sw = (isNaN(osw) || !isFinite(osw)) ? 1 : osw, //sanitize stroke width
			additionalProps = {
				'strokeColor': Color.toRGB(this.stroke),
				'strokeOpacity' : 1, //TODO: once we have tools to adjust this, set
				'fillColor': Color.toRGB(this.fill),
				'fillOpacity': 1, //TODO: once we have tools to adjust this, set
				'strokeWidthTarget': sw * sf
			},
			matrix = {
				'Class': 'CanvasAffineTransform',
				a : m.get(0,0),
				b : m.get(1,0),
				c : m.get(0,1),
				d : m.get(1,1),
				tx: m.get(0,2),
				ty: m.get(1,2)
			};

		Ext.copyTo(additionalProps, this, 'sides');

		return Ext.apply(
				{
					'Class': Ext.String.format('Canvas{0}Shape',this.getJSONType()),
					transform: matrix
				},
				additionalProps);

	}
});
