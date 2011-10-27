Ext.define('NextThought.view.widgets.draw.Whiteboard', {
	extend		: 'Ext.panel.Panel',
	alias		: 'widget.whiteboard',
	requires	: [
		'Ext.draw.Component',
		'Ext.menu.ColorPicker',
		'NextThought.view.widgets.draw.Resizer'
	],

	cls: 'whiteboard',
	layout:'fit',
	items: { xtype: 'draw', viewBox: false },
	dockedItems: [{
		dock: 'left',
		xtype: 'toolbar',
		cls: 'whiteboard-toolbar',
		defaults: {enableToggle: true, toggleGroup:'draw'},
		items: [
			{ iconCls: 'tool rect',		tooltip: 'rect',		shape: 'rect' },
			{ iconCls: 'tool circle',	tooltip: 'circle',		shape: 'circle' },
			{ iconCls: 'tool line',		tooltip: 'line',		shape: 'path'},
			{ iconCls: 'tool text',		tooltip: 'text box',	shape: 'text'},
			'-',
			{ iconCls: 'tool delete',	tooltip: 'delete',		action: 'delete', toggleGroup: null, enableToggle: false },
			'->',
			{
				action: 'pick-color',
				iconCls: 'tool color', tooltip: 'Color',
				enableToggle: false,
				toggleGroup: null
			}
		]
	}],


	toolDefaults: function(shape, color, x, y){
		color = color||'#79BB3F';

		var d = {
			rect: {},
			circle: {},

			path: {
				fill			: 'none',
				'stroke-width'	: 2,
				stroke			: color
			},

			text: {
				text	: 'Text Box',
				font	: '18px Arial'
			}
		};

		return Ext.apply({x:x, y:y, fill:color},d[shape]);
	},


	select: function(sprite){
		if(this.selection){
			this.selection.destroy();
			delete this.selection;
		}

		if(!sprite) return;

		this.selection = Ext.create('NextThought.view.widgets.draw.Resizer',this,sprite);
		this.selection.show(true);
	},


	getSurface: function(){
		if(!this._surf){
			this._surf = this.down('draw').surface;
		}
		return this._surf;
	},




	loadScene: function(canvasJSON){
		var shapes = canvasJSON.shapeList,
			s = this.getSurface();

		Ext.each(shapes, itr, this);

		function itr(shape){
			var o = Ext.apply(shape,{
				draggable: true,
				type: shape['Class'].toLowerCase(),
				x: shape.point.x,
				y: shape.point.y
			});


			s.add(o).show(true);
		}
	},




	saveScene: function(){
		var shapes = [];

		this.getSurface().items.each(
			function(i){
				var a = Ext.clone(i.attr),
					bb = i.getBBox(), x, y;

				if(i.isNib || a.hidden || (!bb.width && !bb.height))return;

				x = a.x + a.translation.x;
				y = a.y + a.translation.y;

				if(a.rotation.degrees)
					a.rotation	= a.rotation.degrees;
				else
					delete a.rotation;

				delete a.hidden;
				delete a.translation;
				delete a.scaling;
				delete a.x;
				delete a.y;

				a["Class"]		= Ext.String.capitalize(i.type);
				a["point"]		= { "Class":"Point", "x":x, "y":y };
				a["length"]		= a.size || a.radius || Math.sqrt((x*x)+(y*y));

				shapes.push(a);
			},
			this
		);



		console.log(shapes);

		return {
			"Class":"Canvas",
			"shapeList": shapes
		};
	},



	addShape: function(shape, x,y, color){
		var sp = this.getSurface().add(
				Ext.apply(
						{
							draggable: true,
							type: shape,
						},
						this.toolDefaults(shape, color, x, y)
				));

		sp.show(true);

		this.relay(sp,'click');
		this.relay(sp,'dblclick');

		return sp;

	},

	relay: function(sprite, event){
		sprite.el.on(
				event,
				function(e){
					e.stopPropagation();
					e.preventDefault();
					this.fireEvent('sprite-'+event,sprite)
				},
				this);
	}
});
