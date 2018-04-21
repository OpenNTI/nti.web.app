const Ext = require('@nti/extjs');

const Globals = require('legacy/util/Globals');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.whiteboard.shapes.Url', {
	extend: 'NextThought.app.whiteboard.shapes.Base',

	constructor: function () {
		this.calculatedAttributes = ['url'];
		this.callParent(arguments);
	},

	draw: function (ctx, renderCallback) {
		var me = this,
			image = me.cache.url || null,
			x, y, w, h;

		if (!image) {
			if (!me.url) {
				renderCallback.call(me);
				return;
			}


			image = new Image();
			image.onload = Ext.bind(me.draw, me, [ctx, renderCallback]);
			image.onerror = Ext.bind(me.imageFailed, me, [image, ctx, renderCallback]);
			me.cache.url = image;
			image.src = me.url;
			return;
		}

		me.callParent(arguments);
		w = image.width;
		h = image.height;
		x = -w / 2;
		y = -h / 2;
		ctx.drawImage(image, x, y);
		me.bbox = {x: x, y: y, w: w, h: h};

		if (me.selected === 'Hand') {
			me.showNibs(ctx);
		}

		renderCallback.call(me);
	},


	imageFailed: function (image,ctx,cb) {
		console.log('failed to load: ' + this.url);
		if (this.url !== Globals.CANVAS_URL_SHAPE_BROKEN_IMAGE.src && Globals.CANVAS_URL_SHAPE_BROKEN_IMAGE.src) {
			image.src = Globals.CANVAS_URL_SHAPE_BROKEN_IMAGE.src;
			return;
		}

		cb.call(this);
	}
});
