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

		this.selectedValues = {
			strokeWidth: 2,
			fillColor: 'None',
			strokeColor: '000000'
		};

		this.addDocked(this.buildToolbar());

		if(this.value){
			this.initialConfig.value = this.value;
		}

		this.currentTool = 'Hand';
		this.canvas = this.down('whiteboard-canvas');
		this.canvas.updateData(this.value);
		this.polygonSidesField = this.down('sliderfield[name=sides]');
		this.textValueField = this.down('textfield[name=text]');
		this.fontSelection = this.down('combobox[name=font-face]');
		this.strokeWidthField = this.down('numberfield[name=strokeWidth]');
		this.deleteSelectedButton = this.down('button[action=delete]');

		this.shapeTools = this.query('[toolGroup]');

		this.mouseMoveHandlerMap = {
			'Hand':		this.doMove,
			'Path':		this.doPath,
			'Line':		this.doLine,
			'Text':		this.doText,
			'Circle':	this.doShape,
			'Polygon':	this.doShape
		};

		this.activateToolOptions('Hand');
	},


	activateToolOptions: function(tool){
		Ext.each(this.shapeTools,function(g){
			if(g.toolGroup===tool){
				g.show();
			}
			else {
				g.hide();
			}
		});
	},


	afterRender: function(){
		this.callParent(arguments);

		this.updateToolValues();

		var el = this.canvas.el, t;

		function over(e) {
			el.addCls('drop-over');
			e.stopPropagation();
			e.preventDefault();
			if(t){ clearTimeout(t); }
			t = setTimeout(function(){el.removeCls('drop-over');}, 100);
			return false; //for IE
		}

		el.on({
			'scope': this,
			'mousedown': this.onMouseDown,
			'mousemove': this.onMouseMove,
			'mouseup': this.onMouseUp,
			'click': this.onClick,
			'dblclick': this.onDoubleClick,
			'contextmenu': this.onContextMenu,

			'drop': this.dropImage,
			'dragenter': over,
			'dragover': over
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
		var me = this, fonts = Ext.create('Ext.data.Store', {
		    fields: ['font','label'],
		    data : [
		        {label: 'Arial',			font:'Arial, Helvetica, sans-serif'},
		        {label: 'Arial Black',		font:'Arial Black, Gadget, sans-serif'},
		        {label: 'Calibri',			font:'Calibri, Georgia, serif'},
				{label: 'Comic Sans',		font:'Comic Sans MS, Comic Sans, cursive'},
		        {label: 'Courier',			font:'Courier New, monospace'},
		        {label: 'Georgia',			font:'Georgia, Calibri, serif'},
				{label: 'Geneva',			font:'Geneva, MS Sans Serif, sans-serif'},
		        {label: 'Helvetica',		font:'Helvetica, Arial, sans-serif'},
		        {label: 'Impact',			font:'Impact, Charcoal, sans-serif'},
		        {label: 'Lucida Console',	font:'Lucida Console, Monaco, monospace'},
		        {label: 'Lucida Grande',	font:'Lucida Sans Unicode, Lucida Grande, sans-serif'},
		        {label: 'New York',			font:'New York, MS Serif, serif'},
		        {label: 'Palatino',			font:'Palatino Linotype, Book Antiqua, Palatino, serif'},
				{label: 'Tahoma',			font:'Tahoma, Geneva, sans-serif'},
				{label: 'Times',			font:'Times New Roman, Times, serif'},
				{label: 'Trebuchet',		font:'Trebuchet MS, sans-serif'},
				{label: 'Verdana',			font:'Verdana, Geneva, sans-serif'}
		    ]
		});

		return {
			dock: 'top',
			xtype: 'toolbar',
			cls: 'whiteboard-toolbar',
			layout: { overflowHandler: 'Scroller' },
			items: [{
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
					{ iconCls: 'tool line',		tooltip: 'line',		shape: 'Line' },
					{ iconCls: 'tool text',		tooltip: 'Text',		shape: 'Text' },
					{ iconCls: 'tool circle',	tooltip: 'Circle',		shape: 'Circle' },
					{ iconCls: 'tool poly',		tooltip: 'polygon',		shape: 'Polygon' },
					{ tooltip: 'Insert Image',
						xtype: 'filefield',
						buttonConfig: {
							iconCls: 'tool image',
							scale: 'medium',
							enableToggle: false,
							toggleGroup: null,
							hideLabel: true
						},
						buttonText: '',
						enableToggle: false,
						toggleGroup: null,
						buttonOnly: true,
						hideLabel: true,
						size: 2,
						listeners: { change: function(c){ me.selectImage(c); } }
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
					name: 'strokeWidth',
					labelWidth: 75,
					width: 180,
					value: 4,
					minValue: 0,
					margin: 5,
					colspan: 2,
					listeners: { change: function(c,v){me.setStrokeWidth(v);} }
				},{
					text: 'Stroke',
					action: 'pick-stroke-color',
					iconCls: 'color', tooltip: 'Stroke Color',
					menu: {
						xtype: 'colormenu',
						allowReselect: true,
						listeners: { select:function(c,v){me.setColor('stroke',v);} }
//					},{
					}
				},{
					text: 'Fill',
					action: 'pick-fill-color',
					iconCls: 'color', tooltip: 'Fill Color',
					menu: {
						xtype: 'colormenu',
						allowReselect: true,
						listeners: { select: function(c, v){ me.setColor('fill',v); } }
					}
				}]
			},
			{
				toolGroup: 'Polygon',
				xtype: 'buttongroup',
				//title: 'Polygon Options',
				items: [
				{
					xtype: 'sliderfield',	fieldLabel: 'Sides',
					labelWidth: 45,			width: 125,
					name: 'sides',			margin: 7,
					value: 4,
					increment: 1,
					minValue: 3,
					maxValue: 10,
					listeners: { change: function(c,v){me.setNumberOfSides(v);} }
				}]
			},
			{
				toolGroup: 'Text',
				xtype: 'buttongroup',
				//title: 'Text Options',
				defaults: {
					labelWidth: 35,
					margin: 5,
					width: 150
				},
				items: [{
					xtype: 'textfield',		fieldLabel: 'Text',
					name: 'text',			value: 'Text Label',
					listeners: {
						scope: this,
						change: function(cmp,value){this.setShapeText(value);}
					}
				},{
					xtype: 'combobox',
					fieldLabel: 'Font',
					name: 'font-face',
					store: fonts,
					editable: false,
					queryMode: 'local',
					displayField: 'label',
					valueField: 'font',
					value: 'Calibri',
					valueNotFoundText: 'Unknown Font',
					listeners: {
						scope: this,
						change: function(cmp,value){this.setShapeFont(value);}
					}
				}]
			}
		]};
	},


	updateToolValues: function(shape){
		var me = this,
			sv = me.selectedValues,
			values = shape ? shape.getJSON() : Ext.clone(sv.original||sv),
			colorRe = /(.+)Color/i,
			opacityRe = /(.+)Opacity/i;

		if(shape && !sv.original){
			sv.original = Ext.apply({},sv);
		}
		else if(!shape ){
			if(sv.original){
				Ext.apply(sv, sv.original);
				delete sv.original;
			}
		}

		Ext.Object.each(values,function(k,v){
			var c = me.down('[name='+k+']'),
				color = colorRe.exec(k),
				opacity = opacityRe.exec(k);


			if(color){
				me.setColor(color[1],v||'None');
			}
			else if(opacity){
				me.setOpacity(opacity[1], v||1);
			}
			else if(c){
				if(shape && k === 'strokeWidth'){
					v = Math.floor( v*me.canvas.getWidth() ) || 1;
				}
				c.setValue(v);
			}
		});


	},


	deselectShape: function(){
		if(this.selected){
			delete this.selected.selected;
			delete this.selected;
		}
		this.deleteSelectedButton.disable();
		this.canvas.drawScene();
		this.activateToolOptions(this.currentTool);
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
			this.activateToolOptions(s.getShapeName());
		}
		else {
			this.activateToolOptions(this.currentTool);
			this.deleteSelectedButton.disable();
		}

		this.updateToolValues(s);
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
			this.selected.selected = this.currentTool || true;
			this.canvas.drawScene();
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
			prop,
			icon = this.down(Ext.String.format('button[action=pick-{0}-color]',c)).getEl().down('.x-btn-icon');

		c = c.toLowerCase();
		prop = c+'Color';
		this.selectedValues[prop] = none? 'None': Color.parseColor(color).toString();

		if(this.selected){
			Ext.copyTo(this.selected, this.selectedValues, [prop]);
			this.selected[c+'Opacity'] = 1;
			this.canvas.drawScene();
		}


		icon.setStyle({background: none? null: this.selectedValues[prop]});
		icon.removeCls('color-none');
		if(none) {
			icon.addCls('color-none');
		}
	},


	setOpacity: function(c,opacity){

	},


	setStrokeWidth: function(stroke){
		this.selectedValues.strokeWidth = stroke;
		var s = this.selected, c = this.canvas;
		if(!s){ return; }
		stroke /= c.el.getWidth();
		s.strokeWidth = isFinite(stroke)? stroke : 0;
		c.drawScene();
	},


	setNumberOfSides: function(sides){
		this.selectedValues.sides = sides;
		var s = this.selected, c = this.canvas;
		if(!s || s.sides===undefined){ return; }
		s.sides = sides;
		c.drawScene();
	},


	setShapeText: function(text){
		this.selectedValues.text = text;
		var s = this.selected, c = this.canvas;
		if(!s || s.text === undefined) { return; }
		s.text = text || '(Empty)';
		c.drawScene();
	},


	setShapeFont: function(font){
		this.selectedValues['font-face'] = font;
		var s = this.selected, c = this.canvas;
		if(!s || s['font-face'] === undefined) { return; }
		s['font-face'] = font;
		c.drawScene();
	},


	selectImage: function(inputField){
		var hasFileApi = Boolean(inputField.fileInputEl.dom.files),
			files = hasFileApi ? inputField.extractFileInput().files : [];
		this.readFile(files);
	},


	dropImage: function(e){
		e.stopPropagation();
		e.preventDefault();

		var dt = e.browserEvent.dataTransfer;

		if(!dt){
			alert('Please use the toolbar, your browser does not support drag & drop file uploads.');
		}
		else {
			this.readFile(dt.files);
		}
		return false; //for IE

	},


	/** @private */
	readFile: function(files){
		var me = this,
			file = files[0],
			reader = new FileReader();

		//file.size
		if(!file || !(/image\/.*/i).test(file.type)){
			console.log('selected file was invalid, or the browser does not support FileAPI');
			return;
		}

		if(reader){
			reader.onload = function(event) { me.insertImage(event.target.result); };
			reader.readAsDataURL(file);
		}
	},


	insertImage: function(dataUrl){
		var image = new Image(),
			me = this,
			c = this.canvas;

		image.onload = function(){
			var m = new NTMatrix(),
				canvasWidth = c.getWidth(),
				s = me.addShape('Url'),
				max = Math.max(image.width,image.height),
				scale = (max > canvasWidth) ? (canvasWidth*0.75)/max : 1;

			s.url = dataUrl;
			m.translate(canvasWidth/2, (scale*image.height/2)+(canvasWidth/10) );
			m.scale(scale);

			m.scaleAll(1/canvasWidth);//do this after

			s.transform = m.toTransform();

			c.drawScene();
		};
		image.src = dataUrl;
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

		try{
			if(nib){ s.modify(nib,	xy[0]/w,xy[1]/w,	m[0]/w,m[1]/w,	dx,dy); }
			else { s.translate(dx,dy); }

			this.mouseDown = xy;
		}
		catch(ex){
			if(ex!=='stop'){
				console.error(ex);
			}
		}

		this.canvas.drawScene();
	},


	doPath: function(e){
		var s = this.selected,
			t,xy,w,p;

		if(!this.mouseDown){ return; }
		if(!s || s.Class !== 'CanvasPathShape' || !s.isNew){
			w = this.canvas.el.getWidth();
			this.selected = s = this.addShape('path');
			s.strokeWidth = this.strokeWidthField.getValue()/w;
			s.points = [];
			s.closed = false;

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
		if(!s || s.Class !== 'CanvasPolygonShape' || s.sides !== 1 || !s.isNew){
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

		if(!s || s.Class !== 'Canvas'+tool+'Shape' || !s.isNew){
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


	doText: function(e){
		if(!this.mouseDown){ return; }

		var tool = this.currentTool,
			s = this.selected,
			w = this.canvas.el.getWidth(),
			p = this.mouseInitialPoint.slice(), m,
			x = p[0],
			y = p[1],
			shapeBaseScale = s&&s.bbox? s.bbox.w : 1;

		if(!s || s.Class !== 'Canvas'+tool+'Shape' || !s.isNew){
			this.selected = this.addShape(tool);
			return;
		}

		p.push.apply(p,this.getRelativeXY(e));


		m = new NTMatrix();
		m.translate(x,y);
		m.scale(WBUtils.getDistance(p)*2/shapeBaseScale);
		m.rotate(WBUtils.getAngle(p));

		m.scaleAll(1/w);//do this after
		s.transform = m.toTransform();

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
		this.deselectShape();
	},


	addShape: function(shape){
		var data = this.canvas.getData() || {'Class': 'Canvas','shapeList':[]},
			stroke = this.selectedValues.strokeWidth/(this.canvas.el.getWidth()),
			defs = {
				'Class': 'Canvas'+Ext.String.capitalize(shape.toLowerCase())+'Shape',
				'fillColor': this.selectedValues.fillColor,
				'fillOpacity': this.selectedValues.fillOpacity || 1,
				'strokeColor': this.selectedValues.strokeColor,
				'strokeOpacity': this.selectedValues.strokeOpacity || 1,
				'strokeWidth': isFinite(stroke)? stroke : 0,
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
			defs.Class = 'CanvasPolygonShape';
		}
		else if(/text/i.test(shape)){
			defs.text = this.textValueField.getValue();
			defs['font-face'] = this.fontSelection.getValue();
		}

		data.shapeList.push(defs);

		this.canvas.updateData(data);

		return this.canvas.drawData.shapeList[0];
	},


	setTool: function(tool){
		delete this.mouseDown;
		this.currentTool = tool;
		this.deselectShape();
		this.activateToolOptions(tool);
	},


	reset: function(){
		this.value = this.initialConfig.value;
		this.canvas.updateData(this.value);
	},


	getValue: function(){
		return this.canvas.getData();
	},


	getThumbnail: function(callback){
		return NextThought.view.whiteboard.Canvas.getThumbnail(this.canvas.getData(),callback);
	}
});
