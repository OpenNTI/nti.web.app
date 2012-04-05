Ext.define(	'NextThought.view.whiteboard.shapes.Url', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	constructor: function(){
		this.calculatedAttributes = ['url'];
		return this.callParent(arguments);
	},

	draw: function(ctx){
		this.callParent(arguments);

		var image = this.cache.url || null,
			x, y, w, h;

		if(!image){
			image = new Image();
			image.src = this.url;
			this.cache.url = image;
		}


		w = image.width;
		h = image.height;
		x = -w/2;
		y = -h/2;

		ctx.drawImage(image,x,y);

		this.bbox = {
			x: x,	w: w,
			y: y,	h: h
		};

		this.performFillAndStroke(ctx);
	}
});
