Ext.define(	'NextThought.view.whiteboard.shapes.Base', {
	requires: [
		'NextThought.util.Color',
		'NextThought.view.whiteboard.Matrix',
		'NextThought.view.whiteboard.Utils'
	],

	STOP_NIB: {},
	IDENTITY: { 'Class':'CanvasAffineTransform', 'a':1, 'b':0, 'c':0, 'd':1, 'tx':0, 'ty':0 },

	constructor: function(config){
		this.calculatedAttributes = ['fillColor','fillOpacity','strokeColor','strokeOpacity'].concat(this.calculatedAttributes||[]);
		this.defineCacheAttributes();
		Ext.apply(this,config);
		return this;
	},


	defineCacheAttributes: function(){
		var me = this,
			defineSetter = '__defineSetter__',
			defineGetter = '__defineGetter__',
			hasDefineProp = Boolean(Object.defineProperty);

		me.tracked = {};
		me.cache = {};

		if(hasDefineProp){
			Object.defineProperty(me,'tracked',{enumerable: false});
			Object.defineProperty(me,'cache',{enumerable: false});
		}

		Ext.each(this.calculatedAttributes,function(p){
			function setter(newValue){this.tracked[p] = newValue; delete this.cache[p];}
			function getter(){ return this.tracked[p]; }

			if(hasDefineProp){
				Object.defineProperty(me,p,{
					enumerable: true,
					set: setter,
					get: getter
				});
			}
			else{
				me[defineSetter](p,setter);
				me[defineGetter](p,getter);
			}
		});
	},


	getShapeName: function(){
		try{
			return (/^Canvas(.+?)Shape$/i).exec(this.Class)[1];
		}
		catch(e){
			return 'Unknown';
		}
	},


	draw: function(ctx,renderCallback){
		var m = new NTMatrix(Ext.clone(this.transform)),
			w = ctx.canvas.width,
			scale;
		m.scaleAll(w);
		scale = m.getScale(true);

		ctx.shadowColor = null;
		ctx.setTransform.apply(ctx,m.m);

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

		ctx.fillStyle = this.cacheColor('fill');
		ctx.strokeStyle = this.cacheColor('stroke');

		ctx.lineWidth = (parseFloat(this.strokeWidth)*w)/scale;
		if(!isFinite(ctx.lineWidth) || isNaN(ctx.lineWidth)){
			ctx.lineWidth = 0;
		}
	},


	cacheColor: function(name){
		var valueKey = name+'Color',
			cache = this.cache[valueKey],
			opacity, value, c;

		if(cache){ return cache; }

		value = this[valueKey];

		if(!value || value === 'None'){
			delete this.tracked[valueKey];
			delete this.cache[valueKey];
			return 'None';
		}

		opacity = this[name+'Opacity'];

		if (typeof opacity !== 'number') {
			opacity = 1;
		}

		try{
			c = Color.parseColor(value);
		}
		catch(er){
			console.log(value);
			return '#000000';
		}
		this[valueKey] = Color.toRGB(c);
		this.cache[valueKey] = Color.toRGBA(c,opacity);
		return this.cache[valueKey];
	},


	getJSON: function(){
		var data = {},
			keys = ['bbox','selected','nibData','cache','tracked'],
			i;

		data.MimeType = 'application/vnd.nextthought.'+(this.Class.toLowerCase());

		for(i in this){
			if(this.hasOwnProperty(i)){
				if( !Ext.isFunction(this[i]) && !Ext.Array.contains(keys,i)){
					data[i] = this[i];
				}
			}
		}


		return data;
	},


	performFillAndStroke: function(ctx){
		if(ctx.fillStyle) { ctx.fill(); }
		if(ctx.strokeStyle && ctx.lineWidth) { ctx.stroke(); }

		if(this.selected === 'Hand'){
			this.showNibs(ctx);
		}
	},


	translate: function(dx, dy){
		var t = this.transform;
		t.tx += dx;
		t.ty += dy;
	},


	/**
	 *
	 * @param m - the current matrix
	 * @param x - the mouse's X cordinate on the canvas
	 * @param y - the mouse's Y cordinate on the canvas
	 * @param dx - the mouse's change in X (magnitude)
	 * @param dy - the mouse's change in Y (magnitude)
	 * @param sx - the sign of dx
	 * @param sy - the sign of dy
	 */
	nibUpdate: function(m, x,y, dx,dy, sx,sy){
		var s = m.getScale(),
			w = this.bbox.w/2,
			h = this.bbox.h/2;

		sx = s[0]+((sx*dx)/w);
		sy = s[1]+((sy*dy)/h);

		if(sx >= 0 && sy >= 0){
			m.scale( 1/s[0], 1/s[1] );
			m.scale( sx, sy );
		}
		else {
			throw this.STOP_NIB;
		}

		return m.toTransform();
	},


	nibRotate: function(m, x,y){
		var t = m.getTranslation(),
			s = m.getScale();

		m = new NTMatrix();
		m.translate(t[0],t[1]);
		m.scale(s[0],s[1]);
		m.rotate(WBUtils.getAngle(t[0],t[1], x,y));

		return m.toTransform();
	},


	modify: function(nib,	x1,y1,	x2,y2,	dx,dy){
		var m = new NTMatrix(this.transform),
			map = {
				'l'		: function() { return this.nibUpdate(m, x1,y1, dx, 0, -1,-1); },
				't'		: function() { return this.nibUpdate(m, x1,y1, 0, dy, -1,-1); },
				't-l'	: function() { return this.nibUpdate(m, x1,y1, dx,dy, -1,-1); },
				'r'		: function() { return this.nibUpdate(m, x1,y1, dx, 0,  1, 1); },
				'b'		: function() { return this.nibUpdate(m, x1,y1, 0, dy,  1, 1); },
				'b-r'	: function() { return this.nibUpdate(m, x1,y1, dx,dy,  1, 1); },
				't-r'	: function() { return this.nibUpdate(m, x1,y1, dx,dy,  1,-1); },
				'b-l'	: function() { return this.nibUpdate(m, x1,y1, dx,dy, -1, 1); },
				'rot'	: function() { return this.nibRotate(m, x1,y1 ); }
			};

		try{
			if(nib === 'rot1' || nib === 'rot2') {
				nib = 'rot';
			}
			this.transform = map[nib].call(this);
		}
		catch(e){
			if(e===this.STOP_NIB){
				throw 'stop';
			}
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
