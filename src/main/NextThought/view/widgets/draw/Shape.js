Ext.define('NextThought.view.widgets.draw.Shape', {
	extend: 'Ext.draw.Sprite',
	alias: 'widget.sprite-base',

	constructor: function(config){
		this.callParent([Ext.apply(config,{
			draggable: true, x:0, y:0, width: 1, height: 1,
		//for some strange reason, even though we tell the browser not to scale the stroke, it still makes the bounding
		// clickable element the size of the shape as if it did scale the stroke... so we Clip it. (the clip gets scaled
		// too.
			'clip-rect': {x:-0.55, y:-0.55, width: 1.1, height: 1.1}
		})]);

		this.on('render', function(s){
			s.el.dom.setAttribute('vector-effect','non-scaling-stroke');
		});
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
			additionalProps = {},
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
