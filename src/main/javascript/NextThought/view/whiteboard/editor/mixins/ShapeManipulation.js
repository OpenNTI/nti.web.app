/**
 *
 * Assumed fields in containing class:
 *
 * {@link NextThought.view.whiteboard.Canvas canvas}
 * currentTool : String
 */
Ext.define('NextThought.view.whiteboard.editor.mixins.ShapeManipulation',{
	requires:[
		'NextThought.view.whiteboard.Matrix',
		'NextThought.view.whiteboard.Utils'
	],


	initMixin: function(toolbar, canvas){
		this.toolbar = toolbar;
		this.canvas = canvas;

		this.mon(this.canvas.el, {
			scope: this,
			mousedown: this.onMouseDown,
			mousemove: this.onMouseMove,
			mouseup: this.onMouseUp,

			mouseenter: this.onMouseEnter,
            mouseout: this.onMouseLeave
		});

		this.mon(this.toolbar.el, {
			scope: this,
			click: this.onToolbarClick
		});

		this.mon(this.toolbar.down('[fillSelectMove]').palette, {
			scope:this,
			select: this.onFillColorChange
		});

		this.mon(this.toolbar.down('[strokeSelectMove]').palette, {
			scope:this,
			select: this.onStrokeColorChange
		});

		this.mon(this.toolbar.down('[editStrokeWidth]'), {
			scope:this,
			select: this.onStrokeWidthChange
		});

		function clearFlag(){ delete this.mouseLeftNoMouseUp;console.log('clear!'); }

		this.mon( Ext.getBody(), {
			scope: this,
			mousedown: clearFlag,
			mouseup: clearFlag,
			mouseout: function(evt){
				var e = evt.browserEvent,
					from = e.relatedTarget || e.toElement;
			    if (!from || from.nodeName === "HTML") {
//				    if(this.mouseLeftNoMouseUp){
//				        alert({title:'Color in the Lines!',msg: 'You have just gone too far this time!'});
//				    }
			        clearFlag.call(this);
			    }
			}
		});

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

	onToolbarClick: function(e){
		var action, c, me = this;
		function togglePressed(){
			var b = Ext.Array.filter(me.toolbar.query('[isEditAction]'), function(b){ return b.pressed});
			if(b.length > 0){ b[0].toggle();}
		}

		if( e.getTarget('.move', undefined, true) ){
			e.stopEvent();
			action = this.toolbar.getCurrentTool().getActionType();

			if(action){
				c = this.moveClickHandlerMap[action];
				if(!c){ return; }
				c.apply(this, arguments);
				setTimeout(function(){
					togglePressed();
				}, 100);
			}
		}
	},

	onFillColorChange: function(e){
		if(!e.value){ return; }
		this.selected.fill = e.value !== 'NONE' ? Color.toRGBA('#'+e.value): null;
		this.canvas.drawScene();
	},

	onStrokeColorChange: function(e){
		if(!e.value){ return; }
		this.selected.stroke = e.value !== 'NONE' ? Color.toRGBA('#'+e.value): null;
		this.canvas.drawScene();
	},

	onStrokeWidthChange: function(e){
		if(!e.value){return;}
		this.selected.strokeWidth = e.value / this.canvas.el.getWidth();
		this.canvas.drawScene();
	},

	onMouseEnter: function(e){
		if(this.mouseLeftNoMouseUp){
			this.onMouseDown(e);
		}
	},

	onMouseLeave: function(e){
		this.mouseLeftNoMouseUp = this.mouseDown;
		this.onMouseUp(e);
	},


	onMouseDown: function(e){
        e.stopEvent();
		var s = this.selected;
		this.mouseDown = true;
		this.mouseInitialPoint = this.getRelativeXY(e);
		this.clickedNib = s? s.isPointInNib(this.mouseInitialPoint) : false;

		//Check selection.
		this.handleSelection(e);
	},


	onMouseMove: function(e){
		if(!this.mouseDown){ return; }
		var tool = this.toolbar.getCurrentTool(),
			c = this.mouseMoveHandlerMap[tool.getToolType()];
		if(!c){
			console.warn('No handler for tool: ',tool.getToolType());
		}

		return c.apply(this,arguments);
	},


	onMouseUp: function(e){
        e.stopEvent();
		delete this.clickedNib;
		delete this.mouseDown;
		delete this.mouseInitialPoint;
		if(this.selected){
			delete this.selected.isNew;
			this.selected.selected = this.currentTool || true;

			if(this.selected.transform.initial){
				this.deleteSelected();
			}
			this.canvas.drawScene();
		}
	},


	handleSelection: function(e){
		e.stopEvent();
		var selectedTool = this.toolbar.getCurrentTool().forTool;
		this.currentTool = selectedTool === 'move' ? "Hand" : selectedTool;
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

	deselectShape: function(){
		if(this.selected){
			delete this.selected.selected;
			delete this.selected;
		}
		this.canvas.drawScene();
		//this.activateToolOptions(this.currentTool);
	},


	selectShape: function(e){
		var c = this.canvas,
			s = null,
			cs = this.selected,
			p = this.getRelativeXY(e),
			sp = this.scalePoint(p), l,sw;

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

		if(s){ delete s.isNew; }

		//Set toolbar Options.
		if(this.selected){
			sw = this.selected.strokeWidth;
			l = Ext.isString(sw) ?  this.selected.strokeWidth.replace('%', '') : sw;
			this.toolbar.getCurrentTool().setOptions({
				fill:this.selected.fill,
				stroke:this.selected.stroke,
				strokeWidth: Math.round(l * this.canvas.el.getWidth())
			});
		}

		c.drawScene();
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
			opts = this.toolbar.getCurrentTool().getOptions(),
			t,xy,w,p;

		if(!this.mouseDown){ return; }
		if(!s || s.Class !== 'CanvasPathShape' || !s.isNew){
			w = this.canvas.el.getWidth();
			this.deselectShape();
			this.currentTool = this.toolbar.getCurrentTool().forTool;

			this.selected = s = this.addShape('path');
			s.strokeWidth = opts.strokeWidth/w;
			s.points = [];
			s.closed = false;


			xy = this.getRelativeXY(e,true);
			t = s.transform;
			t.tx = xy[0];
			t.ty = xy[1];
			delete t.initial;

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
		var tool = this.toolbar.getCurrentTool(),
			opts = tool.getOptions(),
			s = this.selected,
			t,xy,w,p,m;

		if(!this.mouseDown){ return; }
		if(!s || s.Class !== 'CanvasPolygonShape' || s.sides !== 1 || !s.isNew){
			w = this.canvas.el.getWidth();

			this.deselectShape();
			this.currentTool = this.toolbar.getCurrentTool().forTool;

			this.selected = s = this.addShape('polygon');
			s.strokeWidth = opts.strokeWidth/w;

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

		var tool = this.toolbar.getCurrentTool(),
			ttype = tool.getToolType(),
			s = this.selected,
			w = this.canvas.el.getWidth(),
			p = this.mouseInitialPoint.slice(),
			m,
			x = p[0],
			y = p[1], max, distY, distX;

		if(!s || s.Class !== 'Canvas'+Ext.String.capitalize(ttype)+'Shape' || !s.isNew){
			this.deselectShape();
			this.currentTool = this.toolbar.getCurrentTool().forTool;

			this.selected = this.addShape(ttype);
			return;
		}

		p.push.apply(p,this.getRelativeXY(e));

		m = new NTMatrix();
		m.translate(x,y);

		if(s.sides === 4){
			distX = WBUtils.getDistance(p)* 2 * Math.cos(WBUtils.toRadians(WBUtils.getDegrees(p)));
			distY = WBUtils.getDistance(p)* 2 * Math.sin(WBUtils.toRadians(WBUtils.getDegrees(p)));
			max = distX > distY ? distX : distY;
			m.scale(max);
		}
		else{
			m.scale(WBUtils.getDistance(p)*2);
		}

		// FIXME: Stop rotating as we draw.
//		m.rotate(WBUtils.toRadians(WBUtils.getDegrees(p)));

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
			this.deselectShape();
			this.currentTool = this.toolbar.getCurrentTool().forTool;

			this.selected = this.addShape(tool);
			return;
		}

		p.push.apply(p,this.getRelativeXY(e));


		m = new NTMatrix();
		m.translate(x,y);
		m.scale(WBUtils.getDistance(p)*2/shapeBaseScale);
		m.rotate(WBUtils.toRadians(WBUtils.getDegrees(p)));

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
		if(!this.selected || !l || l.length === 0){ console.warn("Nothing is selected."); return;}
		Ext.Array.erase(l,i,1);
		this.deselectShape();
	},

	sendSelectedBack: function(){
		var c = this.canvas,
			l = c.drawData.shapeList,
			i = l.indexOf(this.selected);

		if(!this.selected || !l || l.length === 0){ console.warn("Nothing is selected."); return;}
		Ext.Array.erase(l,i,1);
		Ext.Array.push(l, this.selected);
		c.drawScene();
	},

	sendSelectedFront: function(){
		var c = this.canvas,
			l = c.drawData.shapeList,
			i = l.indexOf(this.selected);

		if(!this.selected || !l || l.length === 0){ console.warn("Nothing is selected."); return;}
		Ext.Array.erase(l,i,1);
		c.addShape(this.selected);
		c.drawScene();
	},

	duplicateSelected: function(){
		var c = this.canvas,
			l = c.drawData.shapeList, i, s = this.selected, w = this.canvas.el.dom.width, sel;

		if(!this.selected || !l || l.length === 0){ console.warn("Nothing is selected."); return;}

		sel = this.selected.selected;
		this.deselectShape();
		i = this.copyShape(s);
		this.selected = i;
		this.selected.selected = sel;
		i.translate(40/w, 40/w);
		setTimeout(function(){ c.drawScene();}, 10);
	},

	addShape: function(shape){
		var opts = this.toolbar.getCurrentTool().getOptions(),
			newShape,
			stroke = opts.strokeWidth/(this.canvas.el.getWidth()),
			defs = {
				'Class': 'Canvas'+Ext.String.capitalize(shape.toLowerCase())+'Shape',
				'fill': opts.fill,
				'stroke': opts.stroke,
				'strokeWidth': isFinite(stroke)? stroke : 0,
				'transform':{
					initial: true,
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

		if(/poly/i.test(shape)){
			defs.sides = opts.sides;
			console.debug('implement path');
		}
/*
		else if(/line/i.test(shape)){
			defs.sides = 1;
			defs.Class = 'CanvasPolygonShape';
		}
*/
		else if(/text/i.test(shape)){
//			defs.text = this.textValueField.getValue();
			console.debug('implement path');
		}


		newShape = this.canvas.makeShape(defs);
		this.canvas.addShape(newShape);

		return newShape;
	},

	copyShape: function(shape){
		var newShape,
			defs = {
				'Class': shape.Class,
				'fill': shape.fill,
				'stroke': shape.stroke,
				'strokeWidth': shape.strokeWidth,
				'transform':{
					'Class':'CanvasAffineTransform',
					'a':shape.transform.a,
					'b':shape.transform.b,
					'c':shape.transform.c,
					'd':shape.transform.d,
					'tx':shape.transform.tx,
					'ty':shape.transform.ty
				}
			};

		newShape = this.canvas.makeShape(defs);
		newShape.cache = {
			fill: shape.cache.fill,
			stroke: shape.cache.stroke
		};

		if(shape.Class === "CanvasPathShape"){
			newShape.points = Ext.clone(shape.points);
			newShape.closed = shape.closed;
		}

		newShape.sides = shape.sides;
		this.canvas.addShape(newShape);
		return newShape;
	}

}, function(){
	var p = this.prototype;

	p.mouseMoveHandlerMap = {
		'move':		p.doMove,
		'pencil':	p.doPath,
		'text':		p.doText,
		'line':		p.doLine,
		'circle':	p.doShape,
		'polygon':	p.doShape
	};

	p.moveClickHandlerMap = {
		'back':         p.sendSelectedBack,
		'forward':      p.sendSelectedFront,
		'duplicate':    p.duplicateSelected,
		'delete':       p.deleteSelected
	}

});
