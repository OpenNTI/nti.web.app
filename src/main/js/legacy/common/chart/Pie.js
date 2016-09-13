var Ext = require('extjs');


//See Working preview at http://jsfiddle.net/jsg2021/7gaU2/
module.exports = exports = Ext.define('NextThought.common.chart.Pie', {
	extend: 'Ext.Component',
	alias: 'widget.pie-chart',
	ui: 'chart',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'canvas', id: '{id}-canvasEl'},
		{id: '{id}-titleEl', cls: 'label title', html: '{title}'},
		{id: '{id}-legendEl', tag: 'ul', cls: 'legend'}
	]),

	childEls: ['canvasEl', 'titleEl', 'legendEl'],

	legendary: new Ext.XTemplate(Ext.DomHelper.markup([
		{ tag: 'tpl', 'for': 'series', cn: [
			{ tag: 'li', cls: 'series label', html: '{label}', style: {color: '{color}'}, 'data-value': '{percent}', 'data-sub': '{sub}', 'data-qtip': '{sub}'}
		]},
		{ tag: 'li', cls: 'total label', html: 'Total: {total}' }
	])),

	config: {
		title: '',
		colors: ['#40b450', /*'#b8b8b8',*/ '#3fb3f6', '#F35252'],
		pixelDensity: 2,
		series: [
			// {value: 12, label: 'foo'},
			// {value: 30, label: 'bar'},
			// {value: 23, label: 'baz'}
		]
	},



	updateSeries: function (v) {
		function sum (a, v) { return a + v.value; }
		function p (v) { return v.value / total; }
		function str (p, i) {
			return {
				percent: (p * 100).toFixed(0),
				label: v[i].label,
				color: colors[i % colors.length],
				sub: v[i].value
			};
		}

		var total = v && v.reduce && v.reduce(sum, 0),
			colors = this.colors;
		this.data = (v && v.map && v.map(p)) || [];

		if (this.rendered) {
			this.legendary.overwrite(this.legendEl, {total: total, series: this.data.map(str)});
			this.redraw();
		}
	},


	beforeRender: function () {
		this.addCls('pie');
		this.callParent(arguments);
		this.renderData.title = this.getTitle();
	},


	afterRender: function () {
		this.callParent(arguments);
		this.canvas = Ext.getDom(this.canvasEl);

		this.viewWidth = this.el.getWidth();
		this.viewHeight = this.el.getHeight();

		this.canvas.width = this.viewWidth * this.getPixelDensity();
		this.canvas.height = this.viewHeight * this.getPixelDensity();
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = true;

		this.updateSeries(this.getSeries());
	},


	redraw: function () {
		if (!this.context) {return;}
		this.context.canvas.width += 0; //set the canvas dirty and make it clear on next draw.
		this.drawPie();
	},


	percentToRadians: function (percent) { return ((percent * 360) * Math.PI) / 180; },


	sumTo: function (i) {
		var sum = 0, j = 0;
		for (j; j < i; j++) {
			sum += this.data[j];
		}
		return sum;
	},


	drawSegment: function (i) {
		var ctx = this.context,
			radius = Math.floor(this.canvas.width / 4),

			startingAngle = this.percentToRadians(this.sumTo(i)),
			arcSize = this.percentToRadians(this.data[i]),
			endingAngle = startingAngle + arcSize,
			endingRadius = radius * 0.5;

		ctx.save();

		ctx.beginPath();

		ctx.moveTo(endingRadius * Math.cos(startingAngle),
					endingRadius * Math.sin(startingAngle));

		ctx.arc(0, 0, radius, startingAngle, endingAngle, false);
		ctx.arc(0, 0, radius * 0.5, endingAngle, startingAngle, true);

		ctx.closePath();

		ctx.fillStyle = this.colors[i % this.colors.length];
		ctx.fill();

		ctx.lineWidth = 5;
		ctx.globalCompositeOperation = 'destination-out';
		ctx.strokeStyle = '#000';
		ctx.stroke();

		ctx.restore();
	},


	drawPie: function () {
		var ctx = this.context,
			centerX = this.canvas.width / 2,
			centerY = this.canvas.height / 2 - 10,
			len = this.data.length, i = 0;

		ctx.save();
		try {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.translate(centerX, centerY);
			ctx.rotate(-Math.PI / 2);

			/*
			ctx.shadowColor = '#ddd';
			ctx.shadowBlur = 5;
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 1;
			*/

			for (i; i < len; i++) {
				this.drawSegment(i);
			}


		} finally {
			ctx.restore();
		}
	}
});
