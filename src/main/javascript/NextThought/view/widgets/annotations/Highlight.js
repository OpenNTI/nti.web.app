Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	alias: 'widget.highlight-annotation',
	requires:[
		'NextThought.cache.IdCache',
		'NextThought.util.Color',
		'NextThought.util.RectUtils',
		'Ext.util.TextMetrics'
	],


	constructor: function(selection, record, component){
		var me = this;

		me.callParent([record, component,'assets/images/charms/highlight-white.png']);

		Ext.apply(me,{
			selection: selection,
			renderPriority: 1,
			canvasContainerId: component.prefix + '-canvas-highlight-container'
		});


		me.canvas = me.createCanvas();

		me.self.highlightEvents.on('render',me.render, me);
		Ext.ComponentManager.register(me);
		return me;
	},

	getItemId: function(){return this.id; },
	isXType: function(){return false;},
	getEl: function(){return Ext.get(this.img);},


	getBlockWidth: function() {
		var s = this.selection,
			n = s.commonAncestorContainer;
		if(n.nodeType===n.TEXT_NODE){
			n = n.parentNode;
		}
		return Ext.fly(n).getWidth();
	},

	getLineHeight: function(){
		var s = this.selection, m,
			n = s.commonAncestorContainer;

		if(n.nodeType===n.TEXT_NODE){
			n = n.parentNode;
		}
		m = new Ext.util.TextMetrics(n);
		return m.getHeight("TEST");
	},


	adjustCoordinates: function(rect,offsetToTrim){
		var x = offsetToTrim[0]!==undefined ? offsetToTrim[0] : offsetToTrim.left,
			y = offsetToTrim[1]!==undefined ? offsetToTrim[1] : offsetToTrim.top;

		return {
			top: rect.top+y,
			left: rect.left+x,
			width: rect.width,
			height: rect.height,
			right: rect.left+x+rect.width,
			bottom: rect.top+y+rect.height
		};
	},


	getRects: function(){
		var rects = [],
			list = this.selection.getClientRects(),
			i=list.length-1,
			xy = Ext.fly(this.canvas).getXY();

		for(;i>=0; i--){ rects.push( this.adjustCoordinates(list[i],xy) ); }

		return rects.reverse();
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
		var cont = this.createCanvasContainer(this.canvasContainerId),
			c = cont.query('canvas')[0];

		if(!c){
			c = this.createElement(
				'canvas',
				cont.dom,
				'highlight-object','position: absolute; pointer-events: none');
			this.ownerCmp.on('resize', this.canvasResize, this);
			this.canvasResize();
		}
		return c;
	},


	canvasResize: function(){
		var c = Ext.get(this.canvas || Ext.query('#'+ this.canvasContainerId +' canvas')[0]),
			cont = Ext.get(this.ownerCmp.getIframe()),
			pos = cont.getXY(),
			size = cont.getSize();
		c.moveTo(pos[0], pos[1]);
		c.setSize(size.width, size.height);
		c.set({
			width: size.width,
			height: size.height
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
		Ext.ComponentManager.unregister(this);
		delete this.selection;
		this.callParent(arguments);
		this.self.highlightEvents.fireEvent('render');//make all highlights redraw...
		this.self.renderCanvas(this.prefix);//this buffered function will only fire after the last invocation. This is to ensure we clear the canvas.
	},



	drawRect: function(rect, fill){
		return function(ctx){
			ctx.fillStyle = fill;
			ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
		};
	},


	requestRender: function(){
		this.callParent(arguments);
		this.self.renderCanvas(this.prefix);//ensure the canvas is redrawn
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
			s = RectUtils.merge(this.selection.getClientRects(),this.getLineHeight(),this.getBlockWidth()),
			l = s.length,
			i = l-1,
			color = this.getColor(),
			rgba = Color.toRGBA(color),
			me = this,
			ox = me.offsets.left;

		if(!r){
			return;
		}

		//move nib
		nib.setStyle({
			left: ox+'px',
			top: r.top +'px'
		});

		//stage draw
		for(; i>=0; i--){
			this.self.enqueue(this, this.drawRect(s[i], rgba));
		}
		this.self.enqueue(this, function(){ delete me.rendering; });
		this.self.renderCanvas(this.prefix);//buffered
		this.callParent();
	},


	statics: {
		highlightEvents: Ext.create('Ext.util.Observable'),
		queue : {},

		enqueue: function(annotation, op){
			var p = annotation.prefix;

			if (!this.queue[p]) {
				this.queue[p] = {
					queue: [],
					canvas: annotation.canvas
				};

			}
			this.queue[p].queue.push(op);
		},

		renderCanvas: function(prefix) {
			if (!this.queue[prefix]){return;}
			
			var c = this.queue[prefix].canvas,
				ctx = c ? c.getContext("2d") : null,
				w = c ? c.width : 0,
				q = Ext.clone(this.queue[prefix].queue);

			this.queue[prefix].queue = [];

			if (!ctx){return;}

			//reset the context
			c.width = w;

			while(q.length){ (q.pop())(ctx); }
		}
	}

},
function(){
	var me = this,
		fn = this.renderCanvas,
		timerId = {};

	this.renderCanvas = (function() {
			return function(prefix) {
				if (timerId[prefix]) {
					clearTimeout(timerId[prefix]);
					timerId[prefix] = null;
				}
				timerId[prefix] = setTimeout(function(){fn.call(me, prefix);}, 100);
			};

		}());
});
