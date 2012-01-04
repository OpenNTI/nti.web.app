Ext.define('NextThought.view.widgets.draw.Rotater', {
	extend: 'Ext.draw.CompositeSprite',
	alias: 'widget.sprite-rotater',
	requires: [
		'NextThought.view.widgets.draw.RotaterNib'
	],

	nibSize: 18,

	constructor: function(whiteboard,sprite){
		this.callParent([{surface: whiteboard.getSurface()}]);

		var c,m = Ext.create('Ext.draw.Matrix'),
			s = this.surface,
			degrees = sprite.attr.rotation.degrees,
			group = s.createSvgElement ? s.createSvgElement('g') : s.createNode('group'),
			bb = sprite.getBBox();

		s.el.appendChild(group);

		this.group = group;
		this.whiteboard = whiteboard;
		this.sprite = sprite;
		this.drawNibs();
		this.hookDrag(sprite);

		c = this.getCenter();
		m.rotate(degrees, c.x, c.y);
		group.setAttribute('transform',m.toSvg());


		this.matrix = m;
		return this;
	},


	destroy: function(){
		this.sprite.dd.startDrag = Ext.draw.SpriteDD.prototype.startDrag;
		this.sprite.dd.onDrag = Ext.draw.SpriteDD.prototype.onDrag;

		//un-group the nibs from the <g> element we created
		var s = this.surface, g = Ext.get(this.group);
		this.each(function(o){ s.el.appendChild(o.el); },this);
		while(g.first()){
			s.el.appendChild(this.group.first().dom);
			console.error('Group node had extra elements in it!? reparenting before we remove it. destroy selection before adding new shapes to the canvas.');
		}
		g.remove();
		this.callParent(arguments);
	},


	getCenter: function(){
		var b = this.sprite.getBBox(),
			x = b.x + b.width/2,
			y = b.y + b.height/2;

		return {x: x, y: y};
	},

	drawNibs: function(){

		function length(x,y,x1,y1){
			return Math.sqrt(Math.pow(x-x1,2)+Math.pow(y-y1,2));
		}

		var b	= this.sprite.getBBox(),
			xc	= b.width/2,
			yc	= b.height/2,
			r = length( xc, yc, 0, 0),
			c = { x: b.x + xc+r, y: b.y + yc };

		this.nib = this.nib || this.addNib({});

		this.nib.setAttributes(c, true);

	},

	hookDrag: function(sprite){
		var me = this,
			s = me.surface,
			rel = s.transformToViewBox;

		sprite.dd.onDrag = function(e){
			Ext.draw.SpriteDD.prototype.onDrag.apply(this, arguments);

			var xy = e.getXY(),
				t = me.first().attr.translation,
				tx,ty;

			xy = rel.apply(s,xy);
			tx = t.x + xy[0] - me.prev[0];
			ty = t.y + xy[1] - me.prev[1];

			me.matrix.translate(tx,ty);
			me.group.setAttribute('transform', me.matrix.toSvg());
			me.prev = xy;

		};

		sprite.dd.startDrag = function(x, y) {
			Ext.draw.SpriteDD.prototype.startDrag.apply(this, arguments);
			me.prev = rel.call(s,x,y);
		};
	},


	addNib: function(cfg){
		var me= this,
			s = me.surface,
			rel = s.transformToViewBox,
			r = Ext.widget('sprite-rotater-nib', Ext.apply({nibSize:this.nibSize},cfg));

		me.add(r);

		r.dd.afterRepair = function(){};//we don't need to repair
		r.dd.onDrag = function(e){

			var c, d,
				points = [me.center.x,me.center.y],
				m = me.matrixSplit;

			points.push.apply(points, me.whiteboard.relativizeXY(rel.apply(s,e.getXY())));

			function degrees(x0,y0, x1,y1){
				var dx	= (x1-x0),
					dy	= (y1-y0),
					a	= (dx<0? 180: dy<0? 360: 0);
				return ((180/Math.PI)*Math.atan(dy/dx)) + a;
			}

			d = degrees.apply(s,points);

			c = me.center;
			me.sprite.setAttributes({rotate:{degrees: d } },true);

			me.matrix = Ext.create('Ext.draw.Matrix');
			me.matrix.rotate(d, c.x, c.y);

			me.group.setAttribute('transform', me.matrix.toSvg());
			me.drawNibs();
			//Ext.draw.SpriteDD.prototype.onDrag.apply(this, arguments);
		};

		r.dd.startDrag = function(x, y) {
//			Ext.draw.SpriteDD.prototype.startDrag.apply(this, arguments);
			me.center = me.getCenter();
			me.matrixSplit = me.matrix.split();
		};

//		r.dd.endDrag = function(){
//			Ext.draw.SpriteDD.prototype.endDrag.apply(this, arguments);
//		};

		return r;
	},

	add: function(c){
		var r = this.surface.add(c);
		this.callParent(arguments);
		Ext.fly(this.group).appendChild(r.el);
		return r;
	}

});
