const Ext = require('@nti/extjs');

const NTMatrix = require('../Matrix');
const WBUtils = require('../Utils');

require('./Base');

module.exports = exports = Ext.define('NextThought.app.whiteboard.shapes.Line', {
	extend: 'NextThought.app.whiteboard.shapes.Base',


	getShapeName: function () {
		return 'Line';
	},


	draw: function (ctx,renderCallback) {
		var t = this.transform,
			xy = this.getEndPoint();

		this.transform = { 'a': 1, 'd': 1, 'tx': t.tx, 'ty': t.ty };
		this.callParent(arguments);
		this.transform = t;

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(xy[0], xy[1]);
		ctx.closePath();

		delete this.cache.fill;
		this.bbox = {
			x: 0,	w: 1,
			y: (-ctx.lineWidth * 3 - 40 / ctx.canvas.width) / 2,	h: (ctx.lineWidth * 3 + 40 / ctx.canvas.width)
		};

		this.performFillAndStroke(ctx);
		renderCallback.call(this);
	},


	getEndPoint: function (m) {
		m = m || new NTMatrix(this.transform);
		var scale = m.getScale(true),
			rad = m.getRotation();
		return [
			scale * Math.cos(rad),
			scale * Math.sin(rad)
		];
	},


	modify: function (nib,	x1,y1) {
		var m = new NTMatrix(this.transform),
			t = m.getTranslation(),
			p = [t[0], t[1]];


		p.push(x1, y1);

		m = new NTMatrix();
		m.translate(t[0], t[1]);
		m.scale(WBUtils.getDistance(p));
		//full range 0-2PI not just -PI/2 - PI/2
		m.rotate(WBUtils.toRadians(WBUtils.getDegrees(p)));

		this.transform = m.toTransform();
	},


	showNibs: function (ctx) {

		ctx.save();

		var m = new NTMatrix(this.transform), drawMatrix = new NTMatrix(), t, scale, rot;

		m.scaleAll(ctx.canvas.width);

		scale = m.getScale();
		t = m.getTranslation();
		rot = m.getRotation();

		drawMatrix.translate(t[0], t[1]);
		drawMatrix.scale(scale[0], scale[1]);
		drawMatrix.rotate(rot);

		ctx.setTransform(1, 0, 0, 1, 0, 0);

		ctx.lineWidth = 2;
		ctx.beginPath();
		this.drawNib(ctx, 7, 1, 0, drawMatrix, m, 'line');

		ctx.closePath();
		ctx.shadowColor = 'None';
		ctx.strokeStyle = '#004CB3';
		ctx.fillStyle = '#8ED6FF';
		ctx.fill();
		ctx.stroke();

		ctx.restore();

	}

});
