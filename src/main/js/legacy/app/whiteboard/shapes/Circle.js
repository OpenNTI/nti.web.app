var Ext = require('extjs');
var ShapesBase = require('./Base');


module.exports = exports = Ext.define('NextThought.app.whiteboard.shapes.Circle', {
	extend: 'NextThought.app.whiteboard.shapes.Base',

	draw: function(ctx,renderCallback) {
		this.callParent(arguments);

		ctx.beginPath();
		ctx.arc(0, 0, 0.5, 0, Math.PI * 2, true);
		ctx.closePath();

		this.bbox = {
			x: -0.5,	w: 1,
			y: -0.5,	h: 1
		};
		this.performFillAndStroke(ctx);
		renderCallback.call(this);
	}
});
