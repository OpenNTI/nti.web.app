Ext.define(	'NextThought.view.whiteboard.shapes.Base', {
	requires: [
		'NextThought.util.Color',
		'NextThought.view.whiteboard.Matrix',
		'NextThought.view.whiteboard.Utils'
	],

	IDENTITY: { 'Class':'CanvasAffineTransform', 'a':1, 'b':0, 'c':0, 'd':1, 'tx':0, 'ty':0 },

	draw: function(ctx){
		var m = new NTMatrix(Ext.clone(this.transform)),
			w = ctx.canvas.width,
			scale;
		m.scaleAll(w);
		scale = m.getScale(true);


		ctx.setTransform.apply(ctx,m.m);


		this.cacheColor('fill');
		this.cacheColor('stroke');

		if(this.selected){
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.shadowBlur = 10;
			ctx.shadowColor = "rgba(0,0,255,1)";
			this.nibData = {};
		}
		else {
			delete this.nibData;
		}

		ctx.fillStyle = this.fillRGBACache;
		ctx.strokeStyle = this.strokeRGBACache;

		ctx.lineWidth = (parseFloat(this.strokeWidth)*w)/scale;
	},


	cacheColor: function(name){
		var cacheKey = name+'RGBACache',
			valueKey = name+'Color',
			opacity = this[name+'Opacity'],
			cache = this[cacheKey],
			value = this[valueKey],
			c;

		if(cache){ return; }

		if(!value || value === 'None'){
			this[valueKey] = null;
			this[cacheKey] = null;
			return;
		}

		if (typeof opacity !== 'number') {
			opacity = 1;
		}

		c = Color.parseColor(value);
		this[valueKey] = Color.toRGB(c);
		this[cacheKey] = Color.toRGBA(c,opacity);
	},


	getJSON: function(){
		var data = Ext.clone(this),
			keys = ['bbox','selected','nibData','fillRGBACache','strokeRGBACache'],
			i = keys.length-1;

		for(; i>=0; i--){
			delete data[keys[i]];
		}

		data.MimeType = 'application/vnd.nextthought.'+(data.Class.toLowerCase());

		return data;
	},


	performFillAndStroke: function(ctx){
		if(this.fillRGBACache) { ctx.fill(); }
		if(this.strokeRGBACache){ ctx.stroke(); }

		if(this.selected){
			this.showNibs(ctx);
		}
	},


	translate: function(dx, dy){
		var t = this.transform;
		t.tx += dx;
		t.ty += dy;
	},


	modify: function(nib,	x1,y1,	x2,y2,	dx,dy){
		var m = new NTMatrix(this.transform),
			t = m.getTranslation(),
			s = m.getScale(),
			map = {
				'l': function(dx) { return update(dx,0, -1, -1); },
				't': function(dx, dy) { return update(0,dy, -1, -1); },
				't-l': function(dx, dy) { return update(dx,dy, -1, -1); },
				'r': function(dx) { return update(dx,0,1,1); },
				'b': function(dx, dy) { return update(0,dy,1,1); },
				'b-r': function(dx, dy) { return update(dx,dy,1,1); },
				't-r': function(dx, dy) { return update(dx,dy,1,-1); },
				'b-l': function(dx, dy) { return update(dx,dy,-1,1); },
				'rot': function(){
					m = new NTMatrix();
					m.translate(t[0],t[1]);
					m.scale(s[0],s[1]);
					m.rotate(WBUtils.getAngle(t[0],t[1], x1,y1));

					return m.toTransform();
				}
			};

		function update(dx, dy, sx, sy) {
			m.scale( 1/s[0], 1/s[1] );
			m.scale( s[0]+(sx*dx), s[1]+(sy*dy) );

			m.translate(-t[0],-t[1]);
			m.translate( t[0]+dx/2, t[1]+dy/2);
			return m.toTransform();
		}


		try{
			if(nib === 'rot1' || nib === 'rot2') {
				nib = 'rot';
			}
			this.transform = map[nib].call(this,dx/2,dy/2);
		}
		catch(e){
			console.error('No modifier for ',nib);
		}
	},


	drawNib: function(ctx,r,x,y, m, name, s, a){

		s = s || 0;
		a = a || Math.PI*2;

		var xy = m.transformPoint(x,y);
		if(name!=='rot1' && name !== 'rot2'){ctx.moveTo(xy[0]+r,xy[1]);}
		ctx.arc(xy[0], xy[1], r, s,a, name!=='rot2');

		//if nibData is there, fill it in, otherwise, throw away the data
		(this.nibData||{})[name] = {
			x: xy[0],
			y: xy[1],
			r: r
		};
	},


	showNibs: function(ctx){
		if(!this.bbox){
			return;
		}

		ctx.save();

		var b = this.bbox,
			m = new NTMatrix(this.transform),
			r, rot;

		//scale the normal values to the current size of the canvas
		m.scaleAll(ctx.canvas.width);

		rot = -m.getRotation();

		ctx.setTransform(1,0,0,1,0,0);

		r = 7;

		b.mx = (b.w/2)+b.x;
		b.my = (b.h/2)+b.y;
		b.xx = b.x + b.w;
		b.yy = b.y + b.h;

		ctx.lineWidth = 2;
		ctx.beginPath();
		this.drawNib(ctx, r, b.x,  b.y, m, 't-l');
		this.drawNib(ctx, r, b.mx, b.y, m, 't');
		this.drawNib(ctx, r, b.xx, b.y, m, 't-r');

		this.drawNib(ctx, r, b.x,  b.my, m, 'l');
		this.drawNib(ctx, r, b.xx, b.my, m, 'r');

		this.drawNib(ctx, r, b.x,  b.yy, m, 'b-l');
		this.drawNib(ctx, r, b.mx, b.yy, m, 'b');
		this.drawNib(ctx, r, b.xx, b.yy, m, 'b-r');

		ctx.closePath();
		ctx.shadowColor = 'None';
		ctx.strokeStyle = '#004CB3';
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
		ctx.stroke();

		ctx.lineCap = 'round';
		ctx.lineWidth *= 2;

		ctx.beginPath();
		this.drawNib(ctx, r*2, b.xx+((r)/m.getScale(true)), b.my, m, 'rot1', (rot+(Math.PI/3)), (rot-(Math.PI/4)));
		ctx.stroke();

		ctx.beginPath();
		this.drawNib(ctx, r*2, b.x-((r)/m.getScale(true)), b.my, m, 'rot2', rot+(2*Math.PI/3), rot-(3*Math.PI/4));
		ctx.stroke();

		ctx.restore();

	},

	changed: function(){
		delete this.fillRGBACache;
		delete this.strokeRGBACache;
	},


	/**
	 *
	 * @param x - canvas coordinate space
	 * @param y - canvas coordinate space
	 *
	 * @returns truthy, with the name of the nib if true, false if not within a nib.
	 */
	isPointInNib: function(x,y){
		var n, nib, nibs = this.nibData, d,dx,dy;
		if(!nibs){ return false; }

		for( n in nibs){
			if(nibs.hasOwnProperty(n)){
				nib = nibs[n];
				dx = nib.x - x;
				dy = nib.y - y;
				d = Math.sqrt(dx*dx + dy*dy);
				if(d <= nib.r){
					return n;
//				} else {
//					console.log(n, 'distance:', d, 'radius:', nib.r,
//							'nib xy: (', nib.x,
//							nib.y,') point: (', x,y, ')');
				}
			}
		}

		return false;
	},


	/**
	 *
	 * @param x - unit coordinate space
	 * @param y - unit coordinate space
	 *
	 * @returns boolean
	 */
	isPointInShape: function(x,y){
		if(!this.bbox){
			console.warn('no bounding box computed');
			return false;
		}

		var b = this.bbox,
			m = new NTMatrix(this.transform),
			x1,y1, x2,y2, x3,y3, x4,y4;

		x1 = m.transformPoint(b.x,b.y);
		y1 = x1[1];
		x1 = x1[0];

		x2 = m.transformPoint(b.x,b.y+b.h);
		y2 = x2[1];
		x2 = x2[0];

		x3 = m.transformPoint(b.x+b.w, b.y+b.h);
		y3 = x3[1];
		x3 = x3[0];

		x4 = m.transformPoint(b.x+b.w, b.y);
		y4 = x4[1];
		x4 = x4[0];

		return this.pointInPolygon(x,y,[
			[x1, x2, x3, x4],
			[y1, y2, y3, y4]
		]);
	},


	/**
	 *  Globals which should be set before calling this function:
	 *
	 *  @param x - point to be tested
	 *  @param y - point to be tested
	 *  @param poly - two dimentional array with horizontal & vertical coordinates of corners in their own arrays
	 *
	 *  @returns true if the point x,y is inside the polygon, or false if it is not.  If the point is
	 *  exactly on the edge of the polygon, then the function may return true or false.
	 */
	pointInPolygon: function(x,y,poly) {

		var polyX = poly[0],
			polyY = poly[1],
			sides = polyX.length,
			i = 0,
			j=sides-1,
			oddNodes=false;

		for (; i<sides; i++)
		{
			if(((polyY[i]< y && polyY[j]>=y)
			||  (polyY[j]< y && polyY[i]>=y))
			&&  (polyX[i]<=x || polyX[j]<=x))
			{
				oddNodes^=(polyX[i]+(y-polyY[i])/(polyY[j]-polyY[i])*(polyX[j]-polyX[i]) < x);
			}
			j=i;
		}

		return oddNodes;
	}

});
