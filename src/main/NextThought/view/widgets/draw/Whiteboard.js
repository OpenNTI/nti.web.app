Ext.define('NextThought.view.widgets.draw.Whiteboard', {
	extend		: 'Ext.panel.Panel',
	alias		: 'widget.whiteboard',
	requires	: [
		'Ext.draw.Component',
		'Ext.menu.ColorPicker',
		'NextThought.view.widgets.draw.Resizer',
		'NextThought.view.widgets.draw.Rotater',
		'NextThought.view.widgets.draw.Polygon',
		'NextThought.view.widgets.draw.Ellipse',
		'NextThought.util.Color'
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
			{	iconCls: 'tool clear',		tooltip: 'clear',		action: 'clear', text: 'clear', toggleGroup: null, enableToggle: false },

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

	initComponent: function(){
		this.callParent(arguments);
		if(this.value){
			this.on('afterrender', function(){
				this.loadScene(this.value);
				delete this.value;
			}, this);
		}
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


	removeAll: function(){
		this.getSurface().removeAll(true);
	},


	select: function(sprite){
		var s = this.selection,
			prev = s ? s.sprite : null;

		if(s){
			s.destroy();
			delete this.selection;
		}

		if(!sprite) return;

		this.selection = Ext.widget((prev === sprite)? 'sprite-rotater':'sprite-resizer',this,sprite);
		this.selection.show(true);
	},


	getSurface: function(){
		if(!this._surf){
			this._surf = this.down('draw').surface;
		}
		return this._surf;
	},


	/* for testing... */
	loadFrom: function(url){
		Ext.Ajax.request({
			url: url,
			scope: this,
			callback: function(o,success,r){
				this.loadScene( Ext.decode(r.responseText) );
			}
		});
	},


	getScaleFactor: function(){
		var m = this, k = 'scaleFactor';
		try{
			return (m[k] = m[k] || this.getWidth());
		}
		catch(e){
			return 1;
		}
	},


	/**
	 * Clone the svg in normalized form. (viewBox of 0,0, 1,1)
	 */
	getThumbnail: function(){
		var id = guidGenerator(),
			div = document.createElement('div'),
			el = Ext.get(div),
			svg, w;

		//This is a little dirty, but it gets the job done.
		div.setAttribute('id',id);
		div.setAttribute('style','display:none');
		document.body.appendChild(div);

		w = Ext.widget('whiteboard', {scaleFactor: 1, value: this.saveScene(), renderTo: id});
		svg = el.down('svg').dom.parentNode.innerHTML;

		w.destroy();
		el.remove();

		return svg.replace(/style=".*?"/ig,'')
					.replace(/<\/*svg[\s"\/\-=0-9a-z:\.;]*>/gi, '');
	},


	loadScene: function(canvasJSON){
		var shapes = canvasJSON.shapeList,
			s = this.getSurface(),
			w = this.getScaleFactor(),
			m = {
				'CanvasPolygonShape': 'sprite-polygon',
				'CanvasCircleShape': 'sprite-ellipse'
			};

		Ext.each(shapes, function(shape, i){

			var c = Color.getColor(i),
				p = c.getDarker(),
				t = shape.transform,
				o, k;

			//scale up the matrix
			for(k in t) t[k] *= w;

			t = Ext.create('Ext.draw.Matrix',t.a,t.b,t.c,t.d,t.tx,t.ty).split();

			o = Ext.widget(m[shape['Class']],{
				sides: shape.sides,
				'stroke-width': 3,
				stroke: p.toString(),
				fill: c.toString(),
				translate: {
					x: t.translateX,
					y: t.translateY
				},
				scale:{
					x: t.scaleX,
					y: t.scaleY
				},
				rotate: {
					degrees: t.rotate
				}
			});

			s.add(o).show(true);
			this.relay(o,'click');
			this.relay(o,'dblclick');

		}, this);
	},

	saveScene: function(){
		var shapes = [];

		this.getSurface().items.each(
			function(i){
				var a = Ext.clone(i.attr),
					bb = i.getBBox(), x, y,
					w = this.getScaleFactor(),
					o, k;

				if(i.isNib || a.hidden || (!bb.width && !bb.height))return;

				o = i.toJSON();
				//scale down the matrix
				for(k in o.transform){
					if(typeof o.transform[k] == 'number')
						o.transform[k] /= w;
				}

				shapes.push(o);
			},
			this
		);

		return shapes.length==0
				?	undefined
				:	{ "Class":"Canvas", "shapeList": shapes };
	}
});
