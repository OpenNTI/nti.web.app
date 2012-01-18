Ext.define('NextThought.view.widgets.annotations.Highlight', {
	extend:'NextThought.view.widgets.annotations.Annotation',
	requires:[
		'NextThought.util.Color'
	],


	constructor: function(selection, record, container, component){
		var me = this,
			userId= record.get('Creator') || _AppConfig.userObject.getId();

		me.callParent([record, container, component,'resources/images/charms/highlight-white.png']);

		Ext.apply(me,{
			_sel: selection,
			_canvas: me._createCanvas(),
			_userId: userId,
			_renderPriority: 1
		});


		me.self._highlightEvents.on('render',me.render, me);
		me.self.addSource(userId);
		return me;
	},


	_createCanvasContainer: function(id){
		var e = Ext.get(id),
			n = e ? e.dom : this.createElement('div',this._cnt,'document-highlights'),
			p = n.parentNode;
		n.setAttribute('id',id);
		p.appendChild(n);
		return Ext.get(n);
	},


	_createCanvas: function(){
		var cont = this._createCanvasContainer('canvas-highlight-container'),
			c = cont.query('canvas')[0];

		if(!c){
			c = this.createElement(
				'canvas',
				cont.dom,
				'highlight-object','position: absolute; pointer-events: none;');
			this._cmp.on('resize', this.canvasResize, this);
			this.canvasResize();
		}
		return c;
	},


	canvasResize: function(){
		var c = Ext.get(this._canvas || Ext.query('#canvas-highlight-container canvas')[0]),
			cont = Ext.get(this._cnt),
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
		if(!me._record.phantom){return;}
		me.isSaving = true;
		me._record.save({
			scope: me,
			failure:function(){
				console.error('Failed to save highlight', me, me._record);
				me.cleanup();
			},
			success:function(newRecord){
				me._record.fireEvent('updated', newRecord);
				me._record = newRecord;
			}
		});
	},


	updateMenuIcon: function(color) {
		var img = this.el.select('img.x-menu-item-icon').first();
		if(img){
			img.setStyle('background', color);
		}
	},


	_buildMenu: function(){
		var items = [],r = this._record;
		if(this._isMine) {
			items.push({
					text : (r.phantom?'Save':'Remove')+' Highlight',
					handler: Ext.bind(r.phantom? this.savePhantom : this.remove, this)
				});
		}

		items.push({
			text : 'Add a Note',
			handler: Ext.bind(this._addNote, this)
		});

		return this.callParent([items]);
	},


	_menuItemHook: function(o,item /*, menu*/){
		item.on('afterrender',Ext.bind(this.updateMenuIcon, item, [o.getColor().toString()]));
	},


	getColor: function(){
		return this.self.getColor(this._userId);
	},


	_addNote: function(){
		this.savePhantom();
		this.getCmp().fireEvent('create-note',this._sel);
	},


	cleanup: function(){
		if(!this._sel){
			return;
		}
		delete this._sel;
		this.callParent(arguments);
		this.self._highlightEvents.fireEvent('render');//make all highlights redraw...
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

		if(!this._sel){
			this.cleanup();
			return;
		}

		if(!this._isVisible){return;}

		if(this.rendering){
			console.warn('duplicate call');
			return;
		}

		this.rendering = true;

		var nib = Ext.get(this._img),
			r = this._sel.getBoundingClientRect(),
			s = this._sel.getClientRects(),
			c = this._canvas,
			p = this._parent ? this._parent : (this._parent = Ext.get(this._div.parentNode)),
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
		_highlightEvents: Ext.create('Ext.util.Observable'),
		_sources : [],
		_queue : [],

		enqueue: function(op){
			this._queue.push(op);
		},

		renderCanvas: function() {
			var c = Ext.query('#canvas-highlight-container canvas')[0],
				ctx = c ? c.getContext("2d") : null,
				w = c ? c.width : 0,
				q = Ext.clone(this._queue);

			this._queue = [];

			if (!ctx){return;}

			//reset the context
			c.width = w;

			while(q.length){ (q.pop())(ctx); }
		},

		addSource: function(userId){
			if(userId && !Ext.Array.contains(this._sources, userId)){
				this._sources.push(userId);
				Ext.Array.sort(this._sources);

				//keep the logged in user at index 0
				var id = _AppConfig.userObject.getId();
				Ext.Array.remove(this._sources,id);
				this._sources.unshift(id);
			}
		},

		getColor: function(userId){
			return Color.getColor( Ext.Array.indexOf(this._sources,userId) );
		}
	}

},
function(){
	this.renderCanvas = Ext.Function.createBuffered(this.renderCanvas,5,this);
});
