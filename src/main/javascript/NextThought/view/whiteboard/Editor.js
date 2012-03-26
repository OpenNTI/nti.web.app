Ext.define(	'NextThought.view.whiteboard.Editor',{
	extend:	'Ext.panel.Panel',
	alias:	'widget.whiteboard-editor',
	requires: [
		'NextThought.view.whiteboard.Canvas',
		'NextThought.view.whiteboard.Matrix',
		'NextThought.view.whiteboard.Utils',
		'Ext.slider.Slider'
	],

	cls: 'whiteboard editor',
	layout: 'fit',
	items: [{xtype: 'whiteboard-canvas'}],

	statics: {
		test: function(){
			Ext.widget('window',{
				closeAction: 'destroy',
				maximized: true,
				maximizable: true,
				layout: 'fit',
				items: {xtype: 'whiteboard-editor'}
			}).show();
		}
	},

	initComponent: function(){
		this.callParent(arguments);
		this.selectedColor = {};

		this.addDocked(this.buildToolbar());

		if(this.value){
		 	this.initialConfig.value = this.value;
		}

		this.currentTool = 'Hand';
		this.canvas = this.down('whiteboard-canvas');
		this.canvas.updateData(this.value);
		this.polygonSidesField = this.down('sliderfield[name=sides]');
		this.strokeWidthField = this.down('numberfield[name=stroke-width]');
		this.deleteSelectedButton = this.down('button[action=delete]');


		this.mouseMoveHandlerMap = {
			'Hand': 	this.doMove,
			'Path': 	this.doPath,
			'Line': 	this.doLine,
			'Text':		this.doText,
			'Circle': 	this.doShape,
			'Polygon':	this.doShape
		};
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


	destroy: function(){
		if(this.canvas.el) {
			this.canvas.el.removeAllListeners();
		}
		this.callParent(arguments);
	},


	getRelativeXY: function(e, scaled){
		var x = e.getXY().slice(),
			c = this.canvas.el.getXY();

		x[0] -= c[0];
		x[1] -= c[1];

		if(scaled){
			x = this.scalePoint(x);
		}

		return x;
	},


	scalePoint: function(xy){
		var w = this.canvas.el.getWidth();

		xy = xy.slice();
		xy[0] /= w;
		xy[1] /= w;

		return xy;
	},


	buildToolbar: function(){
		var me = this;
		return {
			dock: 'top',
			xtype: 'toolbar',
			cls: 'whiteboard-toolbar',
			layout: { overflowHandler: 'Scroller' },
			items: [
				{
					cls: 'whiteboard-toolbar',
					xtype: 'buttongroup',
					defaults: {
						scale: 'medium',
						enableToggle: true,
						allowDepress: false,
						toggleGroup:'draw',
						handler: function(btn, event){
							me.setTool(btn.shape);
						}
					},
					items: [
						{ iconCls: 'tool hand',		tooltip: 'Hand',		shape: 'Hand',	pressed: true },
						{ iconCls: 'tool path',		tooltip: 'Free Hand',	shape: 'Path' },
						{ iconCls: 'tool circle',	tooltip: 'Circle',		shape: 'Circle' },
						{ iconCls: 'tool line',		tooltip: 'line',		shape: 'Line' },
						{ iconCls: 'tool text',		tooltip: 'Text',		shape: 'Text' },
						{ iconCls: 'tool rect',		tooltip: 'polygon',		shape: 'Polygon',
							xtype: 'splitbutton',
							menu: [{
								xtype: 'buttongroup',
								title: 'Polygon Options',
								items: [{
									xtype: 'sliderfield',	fieldLabel: 'Sides',
									labelWidth: 45,			width: 200,
									name: 'sides',			margin: 5,
									value: 4,
									increment: 1,
									minValue: 3,
									maxValue: 10
								}]
							}]
						}
					]
				},
				{
					xtype: 'buttongroup',
					columns: 2,
					cls: 'whiteboard-toolbar',
					defaults: {
						scale: 'medium',
						width: 90
					},
					items: [
						{
							iconCls: 'tool delete',		tooltip: 'Remove Selected Item',
							text: 'Remove',				disabled: true,
							action: 'delete',			handler: function(){ me.deleteSelected(); }
						},{
							iconCls: 'tool clear',		tooltip: 'Clear the canvas',
							text: 'Clear All',			handler: function(){me.clear();}
						}
					]
				},
				{
					xtype: 'buttongroup',
					columns: 4,
					defaults: {
						scale: 'medium',
						width: 90
					},
					items: [
					{
						xtype: 'numberfield',
						fieldLabel: 'Stroke Width',
						name: 'stroke-width',
						labelWidth: 75,
						width: 180,
						value: 4,
						minValue: 0,
						margin: 5,
						colspan: 2
					},{
						text: 'Stroke',
						action: 'pick-stroke-color',
						iconCls: 'color', tooltip: 'Stroke Color',
						menu: {xtype: 'colormenu', colorFor: 'stoke', listeners: {
							scope: this,
							select: function(c, color){ this.setColor('stroke',color); }
						}}
					},{
						text: 'Fill',
						action: 'pick-fill-color',
						iconCls: 'color', tooltip: 'Fill Color',
						menu: {xtype: 'colormenu', colorFor: 'fill', listeners: {
							scope: this,
							select: function(c, color){ this.setColor('fill',color); }
						}}
					}
				]
			}
		]
		};
	},


	deselectShape: function(){
		if(this.selected){
			delete this.selected.selected;
			delete this.selected;
		}
		this.deleteSelectedButton.disable();
		this.canvas.drawScene();
	},


	selectShape: function(e){
		var c = this.canvas,
			s = null,
			cs = this.selected,
			p = this.getRelativeXY(e),
			sp = this.scalePoint(p);

		if(cs && cs.isPointInNib.apply(s,p)){
			return;
		}

		Ext.each(
				c.drawData.shapeList,
				function(o){
					if(!s && o.isPointInShape(sp[0],sp[1])){
						s = o; o.selected = this.currentTool || true;
					}
					else { delete o.selected; }
				},
				this);
		this.selected = s;

		if(s){
			delete s.isNew;
			this.deleteSelectedButton.enable();
		}
		else {
			this.deleteSelectedButton.disable();
		}

		c.drawScene();
	},


	onMouseDown: function(e){
		this.mouseDown = true;
		this.mouseInitialPoint = this.getRelativeXY(e);
		if(this.selected){
			var xy = this.mouseInitialPoint.slice(),
				s = this.selected;
			this.clickedNib = s.isPointInNib.apply(s,xy);
		}
	},


	onMouseMove: function(e){
		if(!this.mouseDown){ return; }
		var c = this.mouseMoveHandlerMap[this.currentTool];
		if(!c){
			console.warn('No handler for tool: ',this.currentTool);
		}

		return c.apply(this,arguments);
	},


	onMouseUp: function(e){
		delete this.clickedNib;
		delete this.mouseDown;
		delete this.mouseInitialPoint;
		if(this.selected){
			delete this.selected.isNew;
		}
	},


	onClick: function(e){
		if(this.currentTool==='Hand'){
			this.selectShape(e);
		}
	},


	onDoubleClick: function(e){},


	onContextMenu: function(e){
		this.selectShape(e);
		e.preventDefault();
		e.stopPropagation();
		alert('show context menu');
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
		var xy = this.getRelativeXY(e),
			m = this.mouseDown,
			w = this.canvas.el.dom.width,
			s = this.selected,
			nib = this.clickedNib, dx, dy;

		if(!m){ return; }
		if(!s){ this.selectShape(e); return; }
		if( m === true ){ m = this.mouseDown = this.mouseInitialPoint.slice(); }

		dx = (xy[0]-m[0])/w;
		dy = (xy[1]-m[1])/w;

		if(nib){ s.modify(nib,	xy[0]/w,xy[1]/w,	m[0]/w,m[1]/w,	dx,dy); }
		else { s.translate(dx,dy); }

		this.mouseDown = xy;
		this.canvas.drawScene();
	},


	doPath: function(e){
		var s = this.selected,
			t,xy,w,p;

		if(!this.mouseDown){ return; }
		if(!s || s['Class'] !== 'CanvasPathShape' || !s.isNew){
			w = this.canvas.el.getWidth();
			this.selected = s = this.addShape('path');
			s.strokeWidth = this.strokeWidthField.getValue()/w;
			s.points = [];

			xy = this.getRelativeXY(e,true);
			t = s.transform;
			t.tx = xy[0];
			t.ty = xy[1];

			return;
		}

		t = s.transform;
		p = this.selected.points;
		xy = this.getRelativeXY(e,true);
		xy[0] -= t.tx;
		xy[1] -= t.ty;
		p.push.apply(p,xy);
		this.canvas.drawScene();
	},


	doLine: function(e){
		var s = this.selected,
			t,xy,w,p,m;

		if(!this.mouseDown){ return; }
		if(!s || s['Class'] !== 'CanvasPolygonShape' || s.sides !== 1 || !s.isNew){
			w = this.canvas.el.getWidth();
			this.selected = s = this.addShape('line');
			s.strokeWidth = this.strokeWidthField.getValue()/w;

			xy = this.getRelativeXY(e,true);
			t = s.transform;
			t.tx = xy[0];
			t.ty = xy[1];
			return;
		}


		xy = this.getRelativeXY(e,true);
		t = s.transform;
		m = new NTMatrix();
		p = [t.tx, t.ty];
		p.push(xy[0],xy[1]);
		m.translate(t.tx,t.ty);
		m.scale(WBUtils.getDistance(p));
		m.rotate(WBUtils.toRadians(WBUtils.getDegrees(p)));

		s.transform = m.toTransform();
		this.canvas.drawScene();
	},


	doShape: function(e){
		if(!this.mouseDown){ return; }

		var tool = this.currentTool,
			s = this.selected, w = this.canvas.el.getWidth(),
			p = this.mouseInitialPoint.slice(),
			m,
			x = p[0],
			y = p[1];

		if(!s || s['Class'] !== 'Canvas'+tool+'Shape' || !s.isNew){
			this.selected = this.addShape(tool);
			return;
		}

		p.push.apply(p,this.getRelativeXY(e));

		m = new NTMatrix();
		m.translate(x,y);
		m.scale(WBUtils.getDistance(p)*2);
		m.rotate(WBUtils.getAngle(p));

		m.scaleAll(1/w);//do this after
		s.transform = m.toTransform();

		this.canvas.drawScene();
	},


	doText: function(e){},


	clear: function(){
		this.canvas.updateData(null);
		this.canvas.drawScene();
	},


	deleteSelected: function(){
		var c = this.canvas,
			l = c.drawData.shapeList,
			i = l.indexOf(this.selected);

		Ext.Array.erase(l,i,1);
		this.deselectShape();
	},


	addShape: function(shape){
		var data = this.canvas.getData() || {'Class': 'Canvas','shapeList':[]},
			stroke = this.strokeWidthField.getValue()/(this.canvas.el.getWidth()),
			defs = {
				'Class': 'Canvas'+Ext.String.capitalize(shape.toLowerCase())+'Shape',
				'fillColor': this.selectedColor['fill'],
				'strokeColor': this.selectedColor['stroke'],
				'strokeWidth': stroke,
				'transform':{
					'Class':'CanvasAffineTransform',
					'a':1,
					'b':0,
					'c':0,
					'd':1,
					'tx':0,
					'ty':0
				},
				isNew: true
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

		return this.canvas.drawData.shapeList[0];
	},


	setTool: function(tool){
		delete this.mouseDown;
		this.currentTool = tool;
		this.deselectShape();
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
