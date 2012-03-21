Ext.define(	'NextThought.view.whiteboard.shapes.Path', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	draw: function(ctx){
		this.callParent(arguments);

		var p = Ext.clone(this.points),
			l = p.length, i = 0, x, y,
			minx=0, miny=0,
			maxx=0, maxy=0;

		ctx.beginPath();
		for(;i<l; i+=2){
			x = p[i];
			y = p[i+1];

			ctx.lineTo(x,y);

			if(x > maxx) { maxx = x; }
			if(x < minx) { minx = x; }

			if(y > maxy) { maxy = y; }
			if(y < miny) { miny = y; }
		}

		this.bbox = {
			x: minx,	w: maxx-minx,
			y: miny,	h: maxy-miny
		};

		this.performFillAndStroke(ctx);
	}

});
