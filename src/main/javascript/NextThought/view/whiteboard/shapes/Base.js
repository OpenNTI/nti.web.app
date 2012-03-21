Ext.define(	'NextThought.view.whiteboard.shapes.Base', {
	requires: [
		'NextThought.util.Color'
	],


	draw: function(ctx){
		var m = Ext.clone(this.transform),
			w = ctx.canvas.width,
			scale = (m.a===1 || m.d === 1)
				? w * m.a * m.d
				: ((w*(m.a+m.d))/2);

		ctx.setTransform( m.a*w, m.c*w, m.b*w, m.d*w, m.tx*w, m.ty*w );

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
		}

		ctx.fillStyle = this.fillRGBA;
		ctx.strokeStyle = this.strokeRGBA;
		ctx.lineWidth = (parseFloat(this.strokeWidth)*w)/scale;
	},


	performFillAndStroke: function(ctx){
		if(this.fillRGBA) { ctx.fill(); }
		if(this.strokeRGBA){ ctx.stroke(); }

//		this.showBBox(ctx);
	},


	showBBox: function(ctx){
		if(this.bbox){
			var b = this.bbox,
				w = ctx.canvas.width,
				m = this.transform,
				scale = (m.a===1 || m.d === 1)
						? w * m.a * m.d
						: ((w*(m.a+m.d))/2);
			ctx.strokeStyle = 'blue';
			ctx.lineWidth = 1/scale;
			ctx.strokeRect(b.x,b.y,b.w,b.h);
		}
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
	 * @returns boolean
	 */
	isPointInShape: function(x,y){
		if(!this.bbox){
			console.warn('no bounding box computed');
			return false;
		}

		var b = this.bbox,
			m = this.transform, dx, dy, ddx, ddy;


		dx = (b.x * m.a + b.y * m.b + m.tx);
		dy = (b.x * m.c + b.y * m.d + m.ty);

		ddx = ((b.x+b.w) * m.a + (b.y+b.h) * m.b + m.tx);
		ddy = ((b.x+b.w) * m.c + (b.y+b.h) * m.d + m.ty);

//		dx = (x * m.a + y * m.b + m.tx);
//		dy = (x * m.c + y * m.d + m.ty);

		return (x >= dx && x <= ddx)
			&& (y >= dy && y <= ddy);
	}
});
