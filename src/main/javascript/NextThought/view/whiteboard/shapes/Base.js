Ext.define(	'NextThought.view.whiteboard.shapes.Base', {
	requires: [
		'NextThought.util.Color',
		'NextThought.view.whiteboard.Matrix'
	],

	IDENTITY: { 'Class':'CanvasAffineTransform', 'a':1, 'b':0, 'c':0, 'd':1, 'tx':0, 'ty':0 },

	draw: function(ctx){
		var m = new NTMatrix(Ext.clone(this.transform)),
			w = ctx.canvas.width,
			scale;
		m.scaleAll(w);
		scale = m.getScale(true);


		ctx.setTransform.apply(ctx,m.m);

		if(!this.fillRGBA){
			this.fillRGBA = !this.fillColor || this.fillColor === 'None'
				? null
				: Color.parseColor(this.fillColor,this.fillOpacity).toString();
		}

		if(!this.strokeRGBA){
			this.strokeRGBA = !this.strokeColor || this.strokeColor === 'None'
				? null
				: Color.parseColor(this.strokeColor,this.strokeOpacity).toString()
		}

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

		ctx.fillStyle = this.fillRGBA;
		ctx.strokeStyle = this.strokeRGBA;

		ctx.lineWidth = (parseFloat(this.strokeWidth)*w)/scale;
	},


	performFillAndStroke: function(ctx){
		if(this.fillRGBA) { ctx.fill(); }
		if(this.strokeRGBA){ ctx.stroke(); }

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
					m.rotate(Math.atan( (t[1]-y1)/(t[0]-x1) ));

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
			this.transform = map[nib].call(this,dx/2,dy/2);
		}
		catch(e){
			console.error('No modifier for ',nib);
		}
	},


	showNibs: function(ctx){
		if(!this.bbox){
			return;
		}

		function drawNib(x,y, name){
			if(name!=='rot'){ctx.moveTo(x+r,y);}
			ctx.arc(x, y, r, s,a, true);

			var xy = m.transformPoint(x, y);
			//if nibData is there, fill it in, otherwise, throw away the data
			(this.nibData||{})[name] = {
				x: xy[0],
				y: xy[1],
				r: r/2
			};
		}

		ctx.save();

		var b = this.bbox,
			m = new NTMatrix(this.transform), scale, r, s=0, a=Math.PI*2;

		scale = m.getScale(true)*ctx.canvas.width;

		r = 7/scale;

		b.mx = (b.w/2)+b.x;
		b.my = (b.h/2)+b.y;
		b.xx = b.x + b.w;
		b.yy = b.y + b.h;

		ctx.lineWidth = 2/scale;
		ctx.beginPath();
		drawNib.call(this, b.x,  b.y, 't-l');
		drawNib.call(this, b.mx, b.y, 't');
		drawNib.call(this, b.xx, b.y, 't-r');

		drawNib.call(this, b.x,  b.my, 'l');
		drawNib.call(this, b.xx, b.my, 'r');

		drawNib.call(this, b.x,  b.yy, 'b-l');
		drawNib.call(this, b.mx, b.yy, 'b');
		drawNib.call(this, b.xx, b.yy, 'b-r');

		ctx.closePath();
		ctx.shadowColor = 'None';
		ctx.strokeStyle = '#004CB3';
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
		ctx.stroke();

		s=Math.PI/3;
		a=-Math.PI/4;
		r*=2;

		ctx.beginPath();
		drawNib.call(this, b.xx+(r*4), b.my, 'rot');
		ctx.lineCap = 'round';
		ctx.lineWidth *= 2;
		ctx.stroke();

//		ctx.strokeRect(b.x,b.y,b.w,b.h);
		ctx.restore();

	},

	changed: function(){
		delete this.fillRGBA;
		delete this.strokeRGBA;
	},


	/**
	 *
	 * @param x - unit coordinate space
	 * @param y - unit coordinate space
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
					console.log(n, d, nib.r, nib.x,nib.y, x,y);
					return n;
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
			if ((polyY[i]< y && polyY[j]>=y
			||   polyY[j]< y && polyY[i]>=y)
			&&  (polyX[i]<=x || polyX[j]<=x))
			{
				oddNodes^=(polyX[i]+(y-polyY[i])/(polyY[j]-polyY[i])*(polyX[j]-polyX[i]) < x);
			}
			j=i;
		}

		return oddNodes;
	}

});
