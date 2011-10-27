Ext.define('NextThought.view.widgets.draw.Resizer', {
	extend: 'Ext.draw.CompositeSprite',

	propertyMap: {
		tl	: {style:{cursor: 'nwse-resize'},	attrs: 'x-y'},
		tr	: {style:{cursor: 'nesw-resize'},	attrs: 'y-width'},
		bl	: {style:{cursor: 'nesw-resize'},	attrs: 'x-height'},
		br	: {style:{cursor: 'nwse-resize'},	attrs: 'width-height'},
		t	: {style:{cursor: 'ns-resize'},		attrs: 'y',				relative: 'mX'},
		l	: {style:{cursor: 'ew-resize'},		attrs: 'x',				relative: 'mY'},
		b	: {style:{cursor: 'ns-resize'},		attrs: 'height',		relative: 'mX'},
		r	: {style:{cursor: 'ew-resize'},		attrs: 'width',			relative: 'mY'},
		d	: {style:{cursor: 'ew-resize'},		attrs: 'radius'}
	},

	attributeModifiers: {
		'x': function(dx, dy, tx, ty)
		{
			var a = this.sprite.attr,
				t = a.translation,
				g = this.groups;

			this.sprite.setAttributes( {
				x:a.x+t.x+dx,
				y:a.y+t.y,
				width: Math.abs( a.width - dx ),
				translation:{x:0,y:0}
			},
			true);

			g.x.setAttributes({ translation:{x:tx} },true);
			if(g.mX) g.mX.setAttributes({ translation:{x:(tx/2)} },true);

			return {x:tx};
		},

		'y': function(dx, dy, tx, ty)
		{
			var a = this.sprite.attr,
				t = a.translation,
				g = this.groups;

			this.sprite.setAttributes( {
				x:a.x+t.x,
				y:a.y+t.y+dy,
				height: Math.abs( a.height - dy ),
				translation:{x:0,y:0}
			},
			true);

			g.y.setAttributes({ translation:{y:ty} },true);
			if(g.mY) g.mY.setAttributes({ translation:{y:(ty/2)} },true);

			return {y:ty};
		}
	},

	constructor: function(whiteboard,sprite){
		this.callParent([{surface: whiteboard.getSurface()}]);

		this.whiteboard = whiteboard;
		this.sprite = sprite;
		this.drawNibs(sprite);
		this.hookDrag(sprite);

		return this;
	},

	drawNibs: function(sprite){
		this.groups = {};

		var t = Ext.String.capitalize(sprite.type),
			fn = this['drawNibsFor'+t];

		this.reset();

		if(!fn){
			console.warn("No method for shape: "+t);
			return;
		}

		fn.call(this, sprite);
	},


	drawNibsForCircle: function(sprite){

		var a = sprite.attr,
			t = a.translation || {},
			o = (this.nibSize/2),
			x = a.x + t.x - o,
			y = a.y + t.y - o;

		this.addNib({x: x+a.radius,	y: y}, 'd');
	},


	drawNibsForRect: function(sprite){
		var b	= sprite.getBBox(),
			x	= b.x,
			y	= b.y,
			w	= b.width,
			h	= b.height,
			s	= this.nibSize,
			x2	= x+w,
			x2m	= x+(w/2)-(s/2),
			y2	= y+h,
			y2m	= y+(h/2)-(s/2);

		this.addNib({x: x-s,		y: y-s},	'tl');
		this.addNib({x: x2m,		y: y-s},	't'	);
		this.addNib({x: x2,			y: y-s},	'tr');
		this.addNib({x: x2,			y: y2m},	'r'	);
		this.addNib({x: x2,			y: y2},		'br');
		this.addNib({x: x2m,		y: y2},		'b'	);
		this.addNib({x: x-s,		y: y2},		'bl');
		this.addNib({x: x-s,		y: y2m},	'l'	);
	},




	hookDrag: function(sprite){
		var me = this;

		sprite.dd.onDrag = function(e){
			Ext.draw.SpriteDD.prototype.onDrag.apply(this, arguments);

			var xy = e.getXY(),
				attr = me.first().attr, dx, dy;

			xy = me.surface.transformToViewBox(xy[0], xy[1]);
			dx = xy[0] - me.prev[0];
			dy = xy[1] - me.prev[1];
			me.setAttributes({
				translate: {
					x: attr.translation.x + dx,
					y: attr.translation.y + dy
				}
			}, true);
			me.prev = xy;

		};

		sprite.dd.startDrag = function(x, y) {
			Ext.draw.SpriteDD.prototype.startDrag.apply(this, arguments);
			me.prev = me.surface.transformToViewBox(x, y);
		};
	},

	destroy: function(){
		this.sprite.dd.startDrag = Ext.draw.SpriteDD.prototype.startDrag;
		this.sprite.dd.onDrag = Ext.draw.SpriteDD.prototype.onDrag;
		this.callParent(arguments);
	},

	addNib: function(cfg, type){
		var me= this,
			r = me.add(Ext.create('Ext.draw.Sprite', Ext.apply(cfg,me.nibBase))),
			p = me.propertyMap[type];

		r.setStyle(p.style);
		r.dd.afterRepair = function(){};//we don't need to repair
		r.dd.onDrag = function(e){
			var xy = e.getXY(),
				sprite = this.sprite,
				attr = sprite.attr, dx, dy, tx, ty,
				m = me.attributeModifiers[p.attrs];

			xy = this.sprite.surface.transformToViewBox(xy[0], xy[1]);
			dx = xy[0] - this.prev[0];
			dy = xy[1] - this.prev[1];
			tx = attr.translation.x + dx;
			ty = attr.translation.y + dy;
			sprite.setAttributes({ translate: m.call(me,dx,dy,tx,ty) }, true);
			this.prev = xy;
		};

		r.dd.endDrag = function(){
			Ext.draw.SpriteDD.prototype.endDrag.apply(this, arguments);
			me.drawNibs(me.sprite);
		};

		Ext.each(p.attrs.toLowerCase().split('-'),function(g){
			me.addToGroup(g,r);
		});

		me.addToGroup(p.relative, r);

		return r;
	},

	addToGroup: function(group, nib){
		if(!group) return;

		var g = this.groups;
		if(!(group in g))
			g[group] = Ext.create('Ext.draw.CompositeSprite', {surface: this.surface});

		g[group].add(nib);
	},

	add: function(c){
		var r = this.surface.add(c);
		this.callParent(arguments);
		r.show(true);
		return r;
	},

	reset: function(){
		var me = this,
			surface = me.getSurface(),
			item;

		if (surface) {
			while (me.getCount() > 0) {
				item = me.first();
				me.remove(item);
				surface.remove(item);
			}
		}
	}

},
function(){
	var s = 8;
	Ext.apply(this.prototype,{
		nibSize : s,
		nibBase : {
			draggable: true,
			type: 'rect',
			width: s,
			height: s,
			fill: '#cccccc',
			stroke: '#0000ff',
			'stroke-width': 1,
			group: 'resize'
		}
	});

	this.prototype.drawNibsForPath = this.prototype.drawNibsForRect;
	this.prototype.drawNibsForText = this.prototype.drawNibsForRect;

});
