Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	requires:[
		'NextThought.util.Color',
		'NextThought.util.RectUtils'
	],


	constructor: function(selection, record, container, component){
		var me = this;

		me.callParent([record, container, component,'assets/images/charms/highlight-white.png']);

		Ext.apply(me,{
			selection: selection,
			canvas: me.createCanvas(),
			renderPriority: 1
		});

		me.self.highlightEvents.on('render',me.render, me);
		return me;
	},

	getLineHeight: function(){
		var s = this.selection,
			n = s.commonAncestorContainer.parentNode;
		return parseInt(Ext.fly(n).getStyle('line-height'),10);
	},


	getRects: function(){
		return this.selection.getClientRects();
	},


	createCanvasContainer: function(id){
		var e = Ext.get(id),
			n = e ? e.dom : this.createElement('div',this.container,'document-highlights'),
			p = n.parentNode;
		n.setAttribute('id',id);
		p.appendChild(n);
		return Ext.get(n);
	},


	createCanvas: function(){
		var cont = this.createCanvasContainer('canvas-highlight-container'),
			c = cont.query('canvas')[0];

		if(!c){
			c = this.createElement(
				'canvas',
				cont.dom,
				'highlight-object','position: absolute; pointer-events: none;');
			this.ownerCmp.on('resize', this.canvasResize, this);
			this.canvasResize();
		}
		return c;
	},


	canvasResize: function(){
		var c = Ext.get(this.canvas || Ext.query('#canvas-highlight-container canvas')[0]),
			cont = Ext.get(this.container),
			pos = cont.getXY(),
			size = cont.getSize();
		c.moveTo(pos[0], pos[1]);
		c.setSize(size.width, size.height);
		c.set({
			width: size.width,
			height: size.height
		});
	},


	savePhantom: function(){
		var me = this;
		if(!me.record.phantom){return;}
		me.isSaving = true;
		me.record.save({
			scope: me,
			failure:function(){
				console.error('Failed to save highlight', me, me.record);
				me.cleanup();
			},
			success:function(newRecord){
				me.record.fireEvent('updated', newRecord);
				me.record = newRecord;
			}
		});
	},


	buildMenu: function(){
		var me = this,
			items = [],
			r = me.record,
			text = r.get('text');

		if(this.isModifiable) {
			items.push({
					text : (r.phantom?'Save':'Remove')+' Highlight',
					handler: Ext.bind(r.phantom? me.savePhantom : me.remove, me)
				});
		}

		if(/^\w+$/i.test(text)){//is it a word
			items.push({
				text: 'Define...',
				handler:function(){ me.ownerCmp.fireEvent('define', text ); }
			});
		}

		items.push({
			text : 'Add a Note',
			handler: function(){
				me.savePhantom();
				me.ownerCmp.fireEvent('create-note',me.selection);
			}
		});

		return this.callParent([items]);
	},


	cleanup: function(){
		if(!this.selection){
			return;
		}
		delete this.selection;
		this.callParent(arguments);
		this.self.highlightEvents.fireEvent('render');//make all highlights redraw...
		this.self.renderCanvas();//this buffered function will only fire after the last invocation. This is to ensure we clear the canvas.
	},


	adjustCoordinates: function(rect,offsetToTrim){
		var x = offsetToTrim[0] ? offsetToTrim[0] : offsetToTrim.left,
			y = offsetToTrim[1] ? offsetToTrim[1] : offsetToTrim.top;

//		rect.top -= y; rect.left -= x;
		return {
			top: rect.top-y,
			left: rect.left-x,
			width: rect.width,
			height: rect.height,
			right: rect.left-x+rect.width,
			bottom: rect.top-y+rect.height
		};
	},


	drawRect: function(rect, fill){
		return function(ctx){
			ctx.fillStyle = fill;
			ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
		};
	},


	requestRender: function(){
		this.callParent(arguments);
		this.self.renderCanvas();//ensure the canvas is redrawn
	},


	render: function(){

//		this.clearCanvas();

		if(!this.selection){
			this.cleanup();
			return;
		}

		if(!this.isVisible){return;}

		if(this.rendering){
			console.warn('duplicate call');
			return;
		}

		this.rendering = true;

		var nib = Ext.get(this.img),
			p = this.parent ? this.parent : (this.parent = Ext.get(this.div.parentNode)),
			c = this.canvas,
			r = this.selection.getBoundingClientRect(),
			s = RectUtils.merge(this.getRects(),this.getLineHeight()),
			l = s.length,
			i = l-1,
			cXY = Ext.get(c).getXY(),
			color = this.getColor(),
			rgba = Color.toRGBA(color),
			me = this;

		if(!r){
			return;
		}

		//move nib
		nib.moveTo(p.getLeft(), r.top);

		//stage draw
		for(; i>=0; i--){
			this.self.enqueue(this.drawRect(this.adjustCoordinates(s[i],cXY), rgba));
		}
		this.self.enqueue(function(){ delete me.rendering; });
		this.self.renderCanvas();//buffered
		this.callParent();
	},


	statics: {
		highlightEvents: Ext.create('Ext.util.Observable'),
		queue : [],

		enqueue: function(op){
			this.queue.push(op);
		},

		renderCanvas: function() {
			var c = Ext.query('#canvas-highlight-container canvas')[0],
				ctx = c ? c.getContext("2d") : null,
				w = c ? c.width : 0,
				q = Ext.clone(this.queue);

			this.queue = [];

			if (!ctx){return;}

			//reset the context
			c.width = w;

			while(q.length){ (q.pop())(ctx); }
		}
	}

},
function(){
	this.renderCanvas = Ext.Function.createBuffered(this.renderCanvas,5,this);
});
