Ext.define(	'NextThought.view.whiteboard.shapes.Url', {
	extend:	'NextThought.view.whiteboard.shapes.Base',

	requires: [
		'NextThought.view.whiteboard.Utils'
	],

	constructor: function(){
		this.calculatedAttributes = ['url'];
		return this.callParent(arguments);
	},

	draw: function(ctx, renderCallback){
		var me = this,
			image = me.cache.url || null,
			x, y, w, h;

		if(!image){
			if(!me.url){
				renderCallback.call(me);
				return;
			}


			image = new Image();
			image.onload = Ext.bind(me.imageLoaded,me,[image,ctx,renderCallback]);
			image.onerror = Ext.bind(me.imageFailed,me,[image,ctx,renderCallback]);
			WBUtils.maybeProxyImage(me.url,image);
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
	},


	imageLoaded: function(image,ctx,cb){
		if(WBUtils.canUse(image)){
			this.draw(ctx,cb);
			return;
		}

		image.src = Globals.CANVAS_URL_SHAPE_BROKEN_IMAGE.src;
	},

	imageFailed: function(image,ctx,cb){
		console.log('failed to load: '+this.url);
		if(this.url !== Globals.CANVAS_URL_SHAPE_BROKEN_IMAGE.src){
			image.src = Globals.CANVAS_URL_SHAPE_BROKEN_IMAGE.src;
			return;
		}

		cb.call(this);
	}
});
