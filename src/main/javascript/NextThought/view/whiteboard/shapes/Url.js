Ext.define(	'NextThought.view.whiteboard.shapes.Url', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	constructor: function(){
		this.calculatedAttributes = ['url'];
		return this.callParent(arguments);
	},

	draw: function(ctx, renderCallback){
		var me = this,
			image = me.cache.url || null,
			x, y, w, h;

		if(!image){
			image = new Image();
			image.onload = function(){ me.draw(ctx,renderCallback); };
			image.src = me.url;
			me.cache.url = image;
			return;
		}

		me.callParent(arguments);
		w = image.width;
		h = image.height;
		x = -w/2;
		y = -h/2;
		ctx.drawImage(image,x,y);
		me.bbox = {x:x,y:y,w:w,h:h};

		if(me.selected === 'Hand'){
			me.showNibs(ctx);
		}

		renderCallback.call(me);
	}
});
