Ext.define('NextThought.view.widgets.draw.Resizer', {
	extend: 'Ext.draw.CompositeSprite',
	alias: 'widget.sprite-resizer',
	requires: [
		'NextThought.view.widgets.draw.ResizerNib'
	],

	nibSize: 8,

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
		'x': function(dx, dy, tx) { return this.updateSprite(dx,0,tx,0, -1, -1); },
		'y': function(dx, dy, tx, ty) { return this.updateSprite(0,dy,0,ty, -1, -1); },

		'x-y': function(dx, dy, tx, ty) { return this.updateSprite(dx,dy,tx,ty, -1, -1); },

		'width': function(dx, dy, tx) { return this.updateSprite(dx,0,tx,0,1,1); },
		'height': function(dx, dy, tx, ty) { return this.updateSprite(0,dy,0,ty,1,1); },

		'width-height': function(dx, dy, tx, ty) { return this.updateSprite(dx,dy,tx,ty,1,1); },

		'y-width': function(dx, dy, tx, ty) { return this.updateSprite(dx,dy,tx,ty,1,-1); },
		'x-height': function(dx, dy, tx, ty) { return this.updateSprite(dx,dy,tx,ty,-1,1); }
	},


	constructor: function(whiteboard,sprite){
		this.callParent([{surface: whiteboard.getSurface()}]);

		var s = this.surface,
//			degrees = sprite.attr.rotation.degrees,
			group = s.createSvgElement ? s.createSvgElement('g') : s.createNode('group');

		s.el.appendChild(group);

		this.group = Ext.get(group);
		this.whiteboard = whiteboard;
		this.sprite = sprite;
		this.drawNibs(sprite);
		this.hookDrag(sprite);

		//haven't worked out the kinks yet for rotating the resize nibs...
//		if(degrees){
//			var c = this.getCenter();
//			group.setAttribute('transform',
//					Ext.String.format('rotate({0},{1},{2})', degrees, c.x, c.y));
//		}

		return this;
	},


	destroy: function(){
		var s = this.surface;
		this.sprite.dd.startDrag = Ext.draw.SpriteDD.prototype.startDrag;
		this.sprite.dd.onDrag = Ext.draw.SpriteDD.prototype.onDrag;
		Ext.Object.each(this.groups, function(k,o){
			o.removeAll();
			o.destroy();
		});

		this.hide(true);

		//un-group the nibs from the <g> element we created
		this.each(function(o){ s.el.appendChild(o.el); },this);
		while(this.group.first()){
			s.el.appendChild(this.group.first().dom);
			console.error('Group node had extra elements in it!? reparenting before we remove it. destroy selection before adding new shapes to the canvas.');
		}
		this.group.remove();

		this.callParent(arguments);
	},


	getCenter: function(){
		var b = this.sprite.getBBox(),
			x = b.x + b.width/2,
			y = b.y + b.height/2;

		return {x: x, y: y};
	},


	updateSprite: function(dx, dy, tx, ty, sx, sy) {
		var a = this.sprite.attr,
			t = a.translation,
			s = a.scaling;

		this.sprite.setAttributes( {
			scale:{
				y: s.y+(sy*dy),
				x: s.x+(sx*dx)
			},
			translate:{
				x: t.x+dx/2,
				y: t.y+dy/2
			}
		},true);

		this.updateNibs();

		return {x:tx ,y:ty};
	},


	updateNibs: function(){
		var g	= this.groups,
			b	= this.sprite.getBBox(),

			x	= b.x,
			y	= b.y,
			w	= b.width,
			h	= b.height,

			s	= this.nibSize,
			s2	= s/2,
			x2	= x+w,
			x2m	= x+(w/2),
			y2	= y+h,
			y2m	= y+(h/2);

		try{
			g.x.setAttributes({x: x-s2});
			g.y.setAttributes({y: y-s2});

			g.width.setAttributes({x: x2});
			g.height.setAttributes({y: y2+s2});

			g.mX.setAttributes({x: x2m});
			g.mY.setAttributes({y: y2m});
		}
		catch(e){
			console.error(e.stack);
		}

		this.redraw();
	},


	drawNibs: function(sprite){
		this.reset();

		var types = ['tl','t','tr','r','br','b','bl','l'];

		Ext.each(types, this.addNib, this);

		//debug:
//		var b = sprite.getBBox();
//		if(b.path) {
//			this.add(Ext.create('Ext.draw.Sprite',{
//				type: 'path',
//				path: b.path,
//				stroke: 'blue',
//				'stroke-width:': 3
//			}));
//		}

		this.updateNibs();
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


	addNib: function(type){
		var me= this,
			r = me.add(Ext.widget('sprite-resizer-nib', {nibSize:this.nibSize})),
			p = me.propertyMap[type];

		r.setStyle(p.style);
		r.dd.afterRepair = function(){};//we don't need to repair
		r.dd.onDrag = function(e){
			var xy = e.getXY(),
				sprite = this.sprite,
				attr = Ext.clone(sprite.attr), dx, dy, tx, ty,
				m = me.attributeModifiers[p.attrs];

			xy = this.sprite.surface.transformToViewBox(xy[0], xy[1]);
			dx = xy[0] - this.prev[0];
			dy = xy[1] - this.prev[1];
			tx = attr.translation.x + dx;
			ty = attr.translation.y + dy;
			sprite.setAttributes({ x: attr.x, y: attr.y,
				translate: m.call(me,dx,dy,tx,ty) }, true);
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
		this.group.appendChild(r.el);
		return r;
	},

	reset: function(){
		var me = this,
			surface = me.getSurface(),
			item;

		this.groups = {};

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

	this.prototype.drawNibsForPath = this.prototype.drawNibsForRect;
	this.prototype.drawNibsForText = this.prototype.drawNibsForRect;

});
