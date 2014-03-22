//See Working preview at http://jsfiddle.net/jsg2021/7gaU2/
Ext.define('NextThought.chart.Pie', {
	extend: 'Ext.Component',
	alias: 'widget.pie-chart',
	ui: 'chart',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'canvas', id: '{id}-canvasEl'},
		{id: '{id}-titleEl', cls: 'label title', html: '{title}'},
		{id: '{id}-legendEl', cls: 'legend'}
	]),

	childEls: ['canvasEl', 'titleEl', 'legendEl'],

	config: {
		title: '',
		color: '#40b450',
		pixelDensity: 2
	},


	beforeRender: function() {
		this.addCls('pie');
		this.callParent(arguments);
		this.renderData.title = this.getTitle();
	},


	afterRender: function() {
		this.callParent(arguments);
		this.canvas = Ext.getDom(this.canvasEl);

		this.viewWidth = this.el.getWidth();
		this.viewHeight = this.el.getHeight();

		this.canvas.width = this.viewWidth * this.getPixelDensity();
		this.canvas.height = this.viewHeight * this.getPixelDensity();
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = true;

		this.redraw();
	},


	redraw: function() {
		if (!this.context) {return;}
		this.context.canvas.width += 0; //set the canvas dirty and make it clear on next draw.
		this.drawCircle();
	},

	drawCircle: function() {
		var ctx = this.context,
				stroke = this.canvas.width * (1 / 112),
				centerX = this.canvas.width / 2,
				centerY = this.canvas.height / 2,
				radius = this.canvas.width / 4;

		ctx.save();
		try {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.translate(centerX, centerY);
			ctx.rotate(-Math.PI / 2);
			ctx.beginPath();
			ctx.arc(0, 0, radius, 0, (2 * Math.PI) * (79 / 100), false);
			ctx.lineWidth = stroke;
			ctx.fillStyle = this.getColor();
			ctx.strokeStyle = this.getColor();

			//ctx.shadowColor = '#ddd';
			//ctx.shadowBlur = 5;
			//ctx.shadowOffsetX = 1;
			//ctx.shadowOffsetY = 1;

			ctx.stroke();
		} finally {
			ctx.restore();
		}
	}
});
