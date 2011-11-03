Ext.define('NextThought.view.widgets.draw.Whiteboard', {
	extend		: 'Ext.panel.Panel',
	alias		: 'widget.whiteboard',
	requires	: [
		'Ext.draw.Component',
		'Ext.menu.ColorPicker',
		'NextThought.view.widgets.draw.Resizer',
		'NextThought.view.widgets.draw.Polygon',
		'NextThought.view.widgets.draw.Ellipse'
	],

	cls: 'whiteboard',
	layout:'fit',
	items: { xtype: 'draw', viewBox: false},
	dockedItems: [{
		dock: 'top',
		xtype: 'toolbar',
		cls: 'whiteboard-toolbar',
		defaults: {enableToggle: true, toggleGroup:'draw'},
		items: [
			{	iconCls: 'tool rect',		tooltip: 'polygon',		shape: 'polygon',
				menu: {
				items: {
					xtype: 'buttongroup',
					title: 'polygon options',
					columns: 1,
					items:[ {
						xtype: 'numberfield',
						fieldLabel: 'Sides',
						name: 'sides',
						value: 4,
						minValue: 3
					} ]
			} } },

			{	iconCls: 'tool circle',		tooltip: 'circle',		shape: 'ellipse' },
			{	iconCls: 'tool line',		tooltip: 'line',		shape: 'line'},
			{	iconCls: 'tool path',		tooltip: 'path',		shape: 'path'},
			{	iconCls: 'tool text',		tooltip: 'text box',	shape: 'text'},

			'-',

			{	iconCls: 'tool delete',		tooltip: 'delete',		action: 'delete', text: 'remove selection', toggleGroup: null, enableToggle: false },

			'->',
			{
				xtype: 'numberfield',
				fieldLabel: 'Stroke',
				name: 'stroke-width',
				width: 100,
				labelWidth: 40,
				value: 1,
				minValue: 0
			},{
				action: 'pick-stroke-color',
				iconCls: 'color', tooltip: 'Stroke Color',
				enableToggle: false,
				toggleGroup: null,
				menu: {xtype: 'colormenu', colorFor: 'stoke'}
			},'-',{
				text: 'Fill',
				action: 'pick-fill-color',
				iconCls: 'color', tooltip: 'Fill Color',
				enableToggle: false,
				toggleGroup: null,
				menu: {xtype: 'colormenu', colorFor: 'fill'}
			}
		]
	}],

	shapeTypeMap: {
		ellipse: 'ellipse',
		line: 'base',
		path: 'base',
		polygon: 'polygon',
		text: 'base'
	},


	toolDefaults: function(shape, color, x, y, strokeWidth, sides){
		strokeWidth = strokeWidth||2;
		sides = sides || 4;

		var d = {
			circle: {},
			polygon: { sides: sides },
			path: { type: 'path', fill: 'none', translate: {} },
			line: { type: 'path', fill: 'none', translate: {}, getShape:function(){return 'line'} },
			text: {
				type: 'text',
				text: 'Place holder text',
				font: '18px Arial'
			}
		};

		var cfg = {
			translate: {x:x,y:y},
			'stroke-width': strokeWidth,
			stroke: color.stroke,
			fill: color.fill
		};

		return Ext.apply(cfg,d[shape]);
	},


	addShape: function(shape, x,y, strokeWidth, sides, color){

		var sp = Ext.widget('sprite-'+this.shapeTypeMap[shape],
				this.toolDefaults(shape, color, x, y, strokeWidth, sides));

		this.getSurface().add(sp).show(true);

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
	},


	removeSelection: function(){
		if(!this.selection)return;

		this.selection.sprite.destroy();

		this.selection.destroy();
		delete this.selection;
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




	loadScene: function(canvasJSON,n){
		var shapes = canvasJSON.shapeList,
			s = this.getSurface(),
			w = this.getWidth();

		Ext.each(shapes, itr, this);

		function itr(shape){
			var o = Ext.apply(shape,{
				draggable: true,
				type: shape['Class'].toLowerCase(),
				x: shape.point.x*w,
				y: shape.point.y*w
			});

			s.add(o).show(true);
		}
	},




	saveScene: function(){
		var shapes = [];

		this.getSurface().items.each(
			function(i){
				var a = Ext.clone(i.attr),
					bb = i.getBBox(), x, y, w = this.getWidth();

				if(i.isNib || a.hidden || (!bb.width && !bb.height))return;

				x = (a.x + a.translation.x)/w;
				y = (a.y + a.translation.y)/w;

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
				a["length"]		= (a.size || a.radius || a.width)/w;

				shapes.push(a);
			},
			this
		);



		console.log(shapes);

		return {
			"Class":"Canvas",
			"shapeList": shapes
		};
	}
});
