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
            mouseout: this.onMouseLeave,

			click: this.onClick
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
				    if(this.mouseLeftNoMouseUp){
				        alert({title:'Color in the Lines!',msg: 'You have just gone too far this time!'});
				    }
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


	onClick: function(e){
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
		//	this.activateToolOptions(s.getShapeName());
		}
//		else {
//			this.activateToolOptions(this.currentTool);
//		}

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
			y = p[1];

		if(!s || s.Class !== 'Canvas'+Ext.String.capitalize(ttype)+'Shape' || !s.isNew){
			this.selected = this.addShape(ttype);
			return;
		}

		p.push.apply(p,this.getRelativeXY(e));

		m = new NTMatrix();
		m.translate(x,y);

		if(s.sides === 4){
			m.scale(WBUtils.getDistance(p)* 2 * Math.cos(WBUtils.toRadians(WBUtils.getDegrees(p))));
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

		Ext.Array.erase(l,i,1);
		this.deselectShape();
	},


	addShape: function(shape){
		var opts = this.toolbar.getCurrentTool().getOptions(),
			data = this.canvas.getData() || {'Class': 'Canvas','shapeList':[]},
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

		data.shapeList.push(defs);

		this.canvas.updateData(data);

		return this.canvas.drawData.shapeList[0];
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

});
