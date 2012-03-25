Ext.define(	'NextThought.view.whiteboard.shapes.Polygon', {
	extend:	'NextThought.view.whiteboard.shapes.Base',


	draw: function(ctx){
		this.callParent(arguments);

		var x = 0,
			y = 0,

			i = 0,
			r = 0.5,
			n = this.sides,
			minx=0, miny=0,
			maxx=0, maxy=0;

		ctx.beginPath();

		for (i; i < n; i++) {
			x = r * Math.cos(2 * Math.PI * i / n);
			y = r * Math.sin(2 * Math.PI * i / n);

			if(x > maxx) { maxx = x; }
			if(x < minx) { minx = x; }

			if(y > maxy) { maxy = y; }
			if(y < miny) { miny = y; }

			(!i? ctx.moveTo : ctx.lineTo).apply(ctx, [x,y]);
		}
		ctx.closePath();
		this.bbox = {
			x: minx,	w: maxx-minx,
			y: miny,	h: maxy-miny
		};

		this.performFillAndStroke(ctx);
	}
});
