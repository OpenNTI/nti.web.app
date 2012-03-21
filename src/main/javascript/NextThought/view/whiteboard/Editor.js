Ext.define(	'NextThought.view.whiteboard.Editor',{
	extend:	'Ext.panel.Panel',
	alias:	'widget.whiteboard-editor',
	requires: [
		'NextThought.view.whiteboard.Canvas'
	],

	cls: 'whiteboard editor',
	layout: 'fit',
	items: [{xtype: 'whiteboard-canvas'}],

	initComponent: function(){
		this.callParent(arguments);
		this.selectedColor = {};

		this.addDocked(this.buildToolbar());

		if(this.value){
		 	this.initialConfig.value = value;
		}

		this.currentTool = 'move';
		this.canvas = this.down('whiteboard-canvas');
		this.canvas.updateData(this.value);
		this.polygonSidesField = this.down('numberfield[name=sides]');
		this.strokeWidthField = this.down('numberfield[name=stroke-width]');
		this.deleteSelectedButton = this.down('button[action=delete]')
	},


	destroy: function(){
		this.canvas.el.removeAllListeners();
		this.callParent(arguments);
	},


	getRelativeXY: function(e, scaled){
		var x = e.getXY(),
			c = this.canvas.el.getXY(),
			w = this.canvas.el.getWidth();

		x[0] -= c[0];
		x[1] -= c[1];

		if(scaled){
			x[0] /= w;
			x[1] /= w;
		}

		return x;
	},


	buildToolbar: function(){
		var me = this;
		return {
			dock: 'top',
			xtype: 'toolbar',
			cls: 'whiteboard-toolbar',
			defaults: {
				scale: 'medium'
			},
			items: [

				{
					text: 'Add',
					tooltip: 'Add a shape',
					menu: [
						{
							cls: 'whiteboard-toolbar',
							xtype: 'buttongroup',
							title: 'Shapes',
							columns: 2,
							defaults: {
								scale: 'medium',
								width: 90,
								handler: function(btn, event){
									me.addShape(btn.shape);
								}
							},
							items: [
								{
									iconCls: 'tool circle',		tooltip: 'circle',
									text: 'Circle',				shape: 'Circle'
								},
								{
									iconCls: 'tool line',		tooltip: 'line',
									text: 'Line',				shape: 'Line'
								},
								{
									iconCls: 'tool text',		tooltip: 'text',
									text: 'Text',				shape: 'Text'
								},
								{
									iconCls: 'tool rect',	tooltip: 'polygon',
									shape: 'polygon',		text: 'Polygon'
								}
						]},

						{
							xtype: 'buttongroup',
							title: 'Polygon Options',
							columns: 1,
							items:[ {
								xtype: 'numberfield',	fieldLabel: 'Sides',
								labelWidth: 45,			width: 150,
								name: 'sides',			value: 4,
								minValue: 3,			margin: 15
							} ]
						}
					]
				},{
					text: 'Tools',
					menu: [{
						cls: 'whiteboard-toolbar',
						xtype: 'buttongroup',
						title: 'Tools',
						columns: 2,
						defaults: {
							scale: 'medium',
							width: 90,
							handler: function(btn, event){
								me.setTool(btn.tool);
							}
						},
						items: [
							{
								iconCls: 'tool hand',		tooltip: 'hand',
								enableToggle: true, 		toggleGroup:'draw',
								allowDepress: false, 		pressed: true,
								text: 'Move',				tool: 'move'
							},
							{
								iconCls: 'tool resize',		tooltip: 'resize',
								enableToggle: true, 		toggleGroup:'draw',
								allowDepress: false,		text: 'Resize',
								tool: 'resize'
							},
							{
								iconCls: 'tool rotate',		tooltip: 'rotate',
								enableToggle: true, 		toggleGroup:'draw',
								allowDepress: false,		text: 'Rotate',
								tool: 'rotate'
							},
							{
								iconCls: 'tool path',		tooltip: 'path',
								enableToggle: true, 		toggleGroup:'draw',
								allowDepress: false, 		text: 'Free hand',
								tool: 'path'
							}
					]}]
				},'-',{
					iconCls: 'tool delete',		tooltip: 'delete',
					text: 'Remove Selected',	disabled: true,
					action: 'delete',
					handler: function(){ me.deleteSelected(); }
				},{
					iconCls: 'tool clear',		tooltip: 'clear',
					text: 'Clear All',			handler: function(){me.clear();}
				},
				'->',
				{
					xtype: 'numberfield',
					fieldLabel: 'Stroke',
					name: 'stroke-width',
					width: 100,
					whiteboardRef: this,
					labelWidth: 40,
					value: 4,
					minValue: 0
				},{
					action: 'pick-stroke-color',
					iconCls: 'color', tooltip: 'Stroke Color',
					menu: {xtype: 'colormenu', colorFor: 'stoke', listeners: {
						scope: this,
						select: function(c, color){ this.setColor('stroke',color); }
					}}
				},'-',{
					text: 'Fill',
					action: 'pick-fill-color',
					iconCls: 'color', tooltip: 'Fill Color',
					menu: {xtype: 'colormenu', colorFor: 'fill', listeners: {
						scope: this,
						select: function(c, color){ this.setColor('fill',color); }
					}}
				}
			]
		};
	},


	selectShape: function(e){
		var c = this.canvas,
			s = null,
			p;

		if(!e && this.selected){
			//tool change
		}
		else {
			p = this.getRelativeXY(e,true);

			Ext.each(c.drawData.shapeList, function(o){

				if(!s && o.isPointInShape.apply(o,p)){
					s = o;
					o.selected = true;
				}
				else {
					delete o.selected;
				}

			});
			this.selected = s;

			if(s){
				this.deleteSelectedButton.enable();
			}
			else {
				this.deleteSelectedButton.disable();
			}
		}

		c.drawScene();
	},


	onMouseDown: function(e){
		this.selectShape(e);
		this.mouseDown = true;
	},


	onMouseMove: function(e){
		var c = this.currentTool;
		if(c==='move'){
			this.doMove(e);
		}
		else if(c==='resize'){}
		else if(c==='rotate'){}

		else if(c==='path'){
			this.doPath(e);
		}
	},


	onMouseUp: function(e){
		delete this.mouseDown;
		if(this.currentTool==='path'){
			this.finishPath(e);
		}
	},


	onClick: function(e){
		this.selectShape(e);
	},


	onDoubleClick: function(e){},


	onContextMenu: function(e){
		this.selectShape(e);
		e.preventDefault();
		e.stopPropagation();
		alert('show context menu');
	},


	afterRender: function(){
		this.callParent(arguments);

		this.setColor('fill', 'None');
		this.setColor('stroke', '000000');


		this.canvas.el.on({
			'scope': this,
			'mousedown': this.onMouseDown,
			'mousemove': this.onMouseMove,
			'mouseup': this.onMouseUp,
			'click': this.onClick,
			'dblclick': this.onDoubleClick,
			'contextmenu': this.onContextMenu
		});
	},


	setColor: function(c, color){

		var none = /none/i.test(color),
			icon = this.down(Ext.String.format('button[action=pick-{0}-color]',c)).getEl().down('.x-btn-icon');

		c = c.toLowerCase();
		this.selectedColor[c] = none? 'None': '#'+color;

		if(this.selected){
			this.selected[c+'Color'] = this.selectedColor[c];
			this.selected.changed();
			this.canvas.drawScene();
		}


		icon.setStyle({background: none? null: this.selectedColor[c]});
		icon.removeCls('color-none');
		if(none) {
			icon.addCls('color-none');
		}
	},


	doMove: function(e){
		if(!this.selected || !this.mouseDown){ return; }
		if( this.mouseDown === true ){
			this.mouseDown = this.getRelativeXY(e);
			return;
		}

		var xy = this.getRelativeXY(e),
			d = xy.slice(),
			m = this.mouseDown,
			w = this.canvas.el.getWidth();

		d[0] -= m[0];
		d[1] -= m[1];

		this.mouseDown = xy;

		this.selected.transform.tx += (d[0]/w);
		this.selected.transform.ty += (d[1]/w);
		this.canvas.drawScene();
	},


	doPath: function(e){
		if(!this.mouseDown){ return; }
		if(!this.selected || this.selected['Class'] !== 'CanvasPathShape'){
			this.setupPath(e);
			return;
		}

		if(!this.selected.unscaled){
			return;
		}

		var p = this.selected.points;
		p.push.apply(p,this.getRelativeXY(e));

		this.canvas.drawScene();
	},


	clear: function(){
		this.canvas.updateData(null);
		this.canvas.drawScene();
	},


	deleteSelected: function(){
		var c = this.canvas,
			l = c.drawData.shapeList,
			i = l.indexOf(this.selected);

		Ext.Array.erase(l,i,1);
		c.drawScene();
	},


	/**
	 *
	 * @param shape name of te shape
	 * @param [skipRender]
	 *
	 * @returns the new shape
	 */
	addShape: function(shape, skipRender){
		var data = this.canvas.getData() || {'Class': 'Canvas','shapeList':[]},
			scale = 0.3,
			stroke = this.strokeWidthField.getValue()/(this.canvas.getWidth()),
			defs = {
				'Class': 'Canvas'+Ext.String.capitalize(shape.toLowerCase())+'Shape',
				'fillColor': this.selectedColor['fill'],
				'strokeColor': this.selectedColor['stroke'],
				'strokeWidth': stroke,
				'transform':{
					'Class':'CanvasAffineTransform',
					'a':scale,
					'b':0,
					'c':0,
					'd':scale,
					'tx':0.5,
					'ty':0.3
				}
			};

		if(/polygon/i.test(shape)){
			defs.sides = this.polygonSidesField.getValue();
		}
		else if(/line/i.test(shape)){
			defs.sides = 1;
			defs['Class'] = 'CanvasPolygonShape';
		}
		else if(/text/i.test(shape)){
			defs.text = 'Text Label';
		}

		data.shapeList.push(defs);

		this.canvas.updateData(data);
		if(skipRender!==false){
			this.canvas.drawScene();
		}
		return this.canvas.drawData.shapeList[0];
	},


	setupPath: function(e){
		var s = this.addShape('path',false),
			t = s.transform,
			xy = this.getRelativeXY(e),
			w = this.canvas.el.getWidth();

		s.strokeWidth = this.strokeWidthField.getValue()/w;
		t.a = t.d = 1/w;
		t.tx = t.ty = 0;
		s.points = xy;
		s.selected = true;

		if(this.selected){
			delete this.selected.selected;
		}

		s.unscaled = true;
		this.selected = s;
	},


	finishPath: function(e){
		if(!this.selected || this.selected['Class'] !== 'CanvasPathShape' || !this.selected.unscaled){
			return;
		}

		var s = this.selected,
			w = this.canvas.el.getWidth(),
			t = s.transform,
			p = s.points,
			i = p.length-1,
			xy = p.slice(0,2), x,y,
			minx=xy[0], miny=xy[1],
			maxx=0, maxy=0;

		delete this.selected;
		delete s.selected;
		delete s.unscaled;

		for( ;i>=0; i-=2){
			x = p[i-1] - xy[0];
			y = p[i  ] - xy[1];

			if(x > maxx) { maxx = x; }
			if(x < minx) { minx = x; }

			if(y > maxy) { maxy = y; }
			if(y < miny) { miny = y; }

			p[i-1] = x/w;
			p[i] = y/w;
		}

		t.a = t.d = 1;

		s.transform.tx = xy[0]/w;
		s.transform.ty = xy[1]/w;

		this.canvas.drawScene();
	},


	setTool: function(tool){
		this.currentTool = tool;
		this.selectShape();
	},


	reset: function(){
		this.value = this.initialConfig.value;
		this.canvas.updateData(this.value);
	},


	getValue: function(){
		return this.canvas.getData();
	},


	getThumbnail: function(){
		return NextThought.view.whiteboard.Canvas.getThumbnail(this.canvas.getData());
	}
});
