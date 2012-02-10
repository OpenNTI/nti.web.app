Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	requires:[
		'NextThought.util.Color'
	],


	constructor: function(selection, record, container, component){
		var me = this,
			userId= record.get('Creator') || $AppConfig.userObject.getId();

		me.callParent([record, container, component,'resources/images/charms/highlight-white.png']);

		Ext.apply(me,{
			selection: selection,
			canvas: me.createCanvas(),
			userId: userId,
			renderPriority: 1
		});


		me.self.highlightEvents.on('render',me.render, me);
		me.self.addSource(userId);
		return me;
	},

	getCmp: function(){
		var r = this.selection.getBoundingClientRect(),
			x,y;

		if(!r) { return; }

		x = r.left;
		y = r.top;

		return {
			getEl: function(){
				return {
					isComposite: true,
					getBox: function(){
						return Ext.apply({ x: x, y: y }, r);
					}
				};
			}
		};
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


	menuItemHook: function(o,item /*, menu*/){
		var color = this.getColor();
		item.on('afterrender',function() {
			var img = item.el.select('img.x-menu-item-icon').first();
			if(img){ img.setStyle('background', color); }
		});
	},


	getColor: function(){
		return this.self.getColor(this.userId);
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

		rect.top -= y; rect.left -= x;
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
			r = this.selection.getBoundingClientRect(),
			s = this.selection.getClientRects(),
			c = this.canvas,
			p = this.parent ? this.parent : (this.parent = Ext.get(this.div.parentNode)),
			l = s.length,
			i = l-1,
			avgH = 0,
			cXY = Ext.get(c).getXY(),
			color = this.getColor(),
			rgba = Color.toRGBA(color),
			rgb = color.toString(),
			me = this;

		if(!r){
			return;
		}

		//move nib
		nib.moveTo(p.getLeft(), r.top);
		nib.setStyle('background', rgb);

		//stage draw
		Ext.each(s,function(v){ avgH += v.height; });
		avgH /= l;

		for(; i>=0; i--){
			//attempt to skip drawing rects that are probably not just the line
			if(s[i].right === r.right && s[i].height>avgH){continue;}

			//TODO: keep track of where we've drawn for this highlight, and don't redraw over it if there are more than
			// one rect over a space.

			this.self.enqueue(this.drawRect(this.adjustCoordinates(s[i],cXY), rgba));
		}
		this.self.enqueue(function(){ delete me.rendering; });
		this.self.renderCanvas();//buffered
		this.callParent();
	},


	statics: {
		highlightEvents: Ext.create('Ext.util.Observable'),
		sources : [],
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
		},

		addSource: function(userId){
			if(userId && !Ext.Array.contains(this.sources, userId)){
				this.sources.push(userId);
				Ext.Array.sort(this.sources);

				//keep the logged in user at index 0
				var id = $AppConfig.userObject.getId();
				Ext.Array.remove(this.sources,id);
				this.sources.unshift(id);
			}
		},

		getColor: function(userId){
			return Color.getColor( Ext.Array.indexOf(this.sources,userId) );
		}
	}

},
function(){
	this.renderCanvas = Ext.Function.createBuffered(this.renderCanvas,5,this);
});
