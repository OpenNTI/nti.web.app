Ext.define('NextThought.view.widgets.draw.Rotater', {
	extend: 'Ext.draw.CompositeSprite',
	alias: 'widget.sprite-rotater',
	requires: [
		'NextThought.view.widgets.draw.RotaterNib'
	],

	nibSize: 20,

	constructor: function(whiteboard,sprite){
		this.callParent([{surface: whiteboard.getSurface()}]);

		var s = this.surface,
			degrees = sprite.attr.rotation.degrees,
			group = s.createSvgElement ? s.createSvgElement('g') : s.createNode('group');

		s.el.appendChild(group);

		console.dir(sprite.attr.rotation);

		this.group = Ext.get(group);
		this.whiteboard = whiteboard;
		this.sprite = sprite;
		this.drawNibs();
		this.hookDrag(sprite);

//		if(degrees){
//			var c = this.getCenter();
//			group.setAttribute('transform',
//					Ext.String.format('rotate({0},{1},{2})', degrees, c.x, c.y));
//		}

		return this;
	},


	destroy: function(){
		this.sprite.dd.startDrag = Ext.draw.SpriteDD.prototype.startDrag;
		this.sprite.dd.onDrag = Ext.draw.SpriteDD.prototype.onDrag;
		this.callParent(arguments);
		this.group.remove();
	},


	degrees: function(dx,dy){
		var a = (dx<0? 180: dy<0? 360: 0);
		return ((180/Math.PI)*Math.atan(dy/dx)) + a;
	},

	getCenter: function(){
		var b = this.sprite.getBBox(),
			x = b.x + b.width/2,
			y = b.y + b.height/2;

		return {x: x, y: y};
	},

	drawNibs: function(){
		this.reset();

		var g	= this.groups,
			b	= this.sprite.getBBox(),
			s	= this.nibSize,
			r	= s/2,

			x	= b.x-r,
			y	= b.y-r,

			x2	= x+b.width-r,
			y2	= y+b.height-r;

		this.addNib({translate:{x: x,	y: y }});
		this.addNib({translate:{x: x2,	y: y }, rotate:{degrees:  90}});
		this.addNib({translate:{x: x2,	y: y2}, rotate:{degrees: 180}});
		this.addNib({translate:{x: x,	y: y2}, rotate:{degrees: -90}});


	},

	hookDrag: function(sprite){
		var me = this,
			s = me.surface,
			rel = s.transformToViewBox;

		sprite.dd.onDrag = function(e){
			Ext.draw.SpriteDD.prototype.onDrag.apply(this, arguments);

			var xy = e.getXY(),
				t = me.first().attr.translation;

			xy = rel.apply(s,xy);
			me.setAttributes({
				translate: {
					x: t.x + xy[0] - me.prev[0],
					y: t.y + xy[1] - me.prev[1]
				}
			}, true);
			me.prev = xy;

		};

		sprite.dd.startDrag = function(x, y) {
			Ext.draw.SpriteDD.prototype.startDrag.apply(this, arguments);
			me.prev = rel.call(s,x,y);
		};
	},


	addNib: function(cfg){
		var me= this,
			r = Ext.widget('sprite-rotater-nib', Ext.apply({nibSize:this.nibSize},cfg));

		me.add(r);

		r.dd.afterRepair = function(){};//we don't need to repair
		r.dd.onDrag = function(e){

			var xy = e.getXY(), dx, dy, c;
			xy = this.sprite.surface.transformToViewBox(xy[0], xy[1]);
			dx = xy[0] - this.prev[0];
			dy = xy[1] - this.prev[1];


			c = {rotate:{degrees:0}};

			me.sprite.setAttributes(c,true);

			Ext.draw.SpriteDD.prototype.onDrag.apply(this, arguments);
			//this.prev = xy;
		};

		r.dd.startDrag = function(x, y) {
			Ext.draw.SpriteDD.prototype.startDrag.apply(this, arguments);

		};

		r.dd.endDrag = function(){
			Ext.draw.SpriteDD.prototype.endDrag.apply(this, arguments);
			me.drawNibs();
		};

		return r;
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

		if (surface) {
			while (me.getCount() > 0) {
				item = me.first();
				me.remove(item);
				surface.remove(item);
			}
		}
	}



});
