Ext.define('NextThought.view.annotations.Highlight', {
	extend:'NextThought.view.annotations.Annotation',
	alias: 'widget.highlight-annotation',
	requires:[
		'NextThought.cache.IdCache',
		'NextThought.util.Color',
		'NextThought.util.Rects',
		'Ext.util.TextMetrics',
		'NextThought.model.Redaction'
	],


	constructor: function(selection, record, component){
		var me = this;

		me.callParent([record, component]);

		Ext.apply(me,{
			selection: selection,
			renderPriority: 1,
			canvasId: component.prefix + '-highlight-canvas'
		});


		me.canvas = me.createCanvas();

		me.self.highlightEvents.on('render',me.render, me);

		return me;
	},

	getItemId: function(){return this.id; },
	isXType: function(){return false;},
	getEl: function(){return Ext.get(this.img);},
	getPosition: function(){
		return Ext.fly(this.img).getXY();
	},


	attachRecord: function(record){
		var me = this,
			i = record.getId(),
			id = IdCache.getComponentId(i, null, me.prefix);

		me.callParent(arguments);

		if (!record.phantom && !Ext.ComponentManager.get(id)) {
			me.id = id;
			Ext.ComponentManager.register(me);
		}
	},


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


	createCanvas: function(){
		var c = document.getElementById(this.canvasId);
		if(!c){
			c = this.createElement(
				'canvas',
				this.ownerCmp.body.dom,
				'highlight-object','position: absolute; top: 0; left:0; pointer-events: none;',
				this.canvasId
				);
			this.ownerCmp.on('resize', this.canvasResize, this);
			this.canvasResize();
		}
		return c;
	},


	canvasResize: function(){
		var c = Ext.get(this.canvas || this.canvasId),
			cont = Ext.get(this.ownerCmp.getIframe()),
			pos = cont.getXY(),
			size = cont.getSize();
		c.moveTo(pos[0], pos[1]);
		Ext.apply(c.dom,{
			width: size.width,
			height: size.height
		});
	},


	buildMenu: function(){
		var me = this,
			items = [],
			r = me.record,
			text = r.get('selectedText'),
			boundingBox = this.ownerCmp.convertRectToScreen(this.selection.getBoundingClientRect()),
			redactionRegex = /USSC-HTML|Howes_converted|USvJones2012_converted/i;

		//adjust boundingBox for screen coords:


		if(this.isModifiable) {
			items.push({
					text : (r.phantom?'Save':'Remove')+' Highlight',
					handler: Ext.bind(r.phantom? me.savePhantom : me.remove, me)
				});

			//hack to allow redactions only in legal texts for now...
			if (redactionRegex.test(LocationProvider.currentNTIID)) {

				if (r.phantom) {
					items.push({
						text : 'Redact Highlight',
						handler: function(){
							var redaction = NextThought.model.Redaction.createFromHighlight(r);
							redaction.save({
								scope: me,
								failure:function(){
									console.error('Failed to save redaction',redaction);
									me.cleanup();
								},
								success:function(){
									me.cleanup();
									me.ownerCmp.fireEvent('redact', redaction);
								}
							});
						}
					});
				}
			}
		}

		if(/^\w+$/i.test(text)){//is it a word
			items.push({
				text: 'Define...',
				handler:function(){ me.ownerCmp.fireEvent('define', text, boundingBox ); }
			});
		}

		items.push({
			text : 'Add a Note',
			handler: function(){
				//me.savePhantom();
				me.ownerCmp.fireEvent('create-note',me.selection);
			}
		});

		return this.callParent([items]);
	},


	cleanup: function(){
		if(!this.selection){
			return;
		}
		if (!this.record.phantom){Ext.ComponentManager.unregister(this);}
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


	render: function() {
		if(!this.selection){
			this.cleanup();
			return;
		}

		if(!this.isVisible){return;}

		if(this.rendering){
			return;
		}

		this.rendering = true;

		var nib = Ext.get(this.img),
			r = this.selection.getBoundingClientRect(),
			s = RectUtils.merge(this.selection.getClientRects(),this.getLineHeight(),this.getBlockWidth()),
			l = s.length,
			i = l-1,
			me = this,
			ox = (me.offsets.left+60)-(nib.getWidth()/2);

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
			this.self.enqueue(this, this.drawRect(s[i], '#a4d8f6'));
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
			c.width = 1; c.width = w;

			ctx.globalCompositeOperation = 'xor';
			ctx.globalAlpha = 0.3;

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
				}
				timerId[prefix] = setTimeout(function(){ fn.call(me, prefix); }, 100);
			};

		}());
});
