//See Working preview at http://jsfiddle.net/jsg2021/7gaU2/
Ext.define('NextThought.chart.Grade', {
	extend: 'Ext.Component',
	alias: 'widget.grade-chart',
	ui: 'course-assessment',
	cls: 'grade',

	autoEl: {
		tag: 'canvas'
	},

	config: {
		color: '#8eb737',
		grade: 90
	},

	afterRender: function() {
		this.callParent(arguments);
		this.canvas = Ext.getDom(this.el);
		this.viewWidth = this.el.getWidth();
		this.viewHeight = this.el.getHeight();
		this.canvas.width = this.viewWidth * 2;
		this.canvas.height = this.viewHeight * 2;
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = true;

		this.redraw();
	},


	updateGrade: function() {
		try {
			this.redraw();
		} catch (e) {
			console.warn(e.stack || e.message || e);
		}
	},


	redraw: function() {
		if (!this.context) {return;}
		this.context.canvas.width += 0; //set the canvas dirty and make it clear on next draw.
		this.drawCircle();
		this.drawDot();
	},


	getGradeLetter: function() {
		var g = this.getGrade();
		if (g >= 90) {
			g = 'A';
		} else if (g >= 80) {
			g = 'B';
		} else if (g >= 70) {
			g = 'C';
		} else if (g >= 60) {
			g = 'D';
		} else {
			g = 'F';
		}

		return g;
	},


	setFont: function(font) {
		this.context.font = [
			font.style || 'normal',
			font.variant || 'normal',
			font.weight || 'normal', (font.size || 10) + 'px',
			font.family || '"Open Sans"'
		].join(' ');
	},


	drawCircle: function() {
		var ctx = this.context,
			stroke = this.canvas.width * (1 / 112),
			centerX = this.canvas.width / 2,
			centerY = this.canvas.height / 2,
			radius = this.canvas.width / 4,
			textbox,
			grade = (this.getGrade() || 0).toString(10),
			font = {
				size: Math.floor(radius * 0.8),
				weight: '300'
			};

		ctx.save();
		try {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.translate(centerX, centerY);
			ctx.rotate(-Math.PI / 2);
			ctx.beginPath();
			ctx.arc(0, 0, radius, 0, (2 * Math.PI) * (grade / 100), false);
			ctx.lineWidth = stroke;
			ctx.fillStyle = this.getColor();
			ctx.strokeStyle = this.getColor();

			ctx.shadowColor = '#ddd';
			ctx.shadowBlur = 5;
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 1;

			ctx.stroke();

			ctx.lineWidth = 0;
			ctx.setTransform(1, 0, 0, 1, centerX, centerY);
			this.setFont(font);
			textbox = ctx.measureText(grade);
			ctx.globalAlpha = 0.8;
			ctx.fillText(grade, -textbox.width / 2, font.size / 3);

			font.size /= 3;
			font.weight = '700';
			this.setFont(font);
			ctx.fillText('%', textbox.width / 2, -font.size / 4);
		} finally {
			ctx.restore();
		}
	},

	drawDot: function() {
		var ctx = this.context,
			slope = this.canvas.height / this.canvas.width,
			centerY = (this.canvas.height / 2) + (this.canvas.width / 4),
			centerX = centerY / slope,
			radius = Math.floor(this.canvas.width * 0.089285714),
			textbox,
			grade = this.getGradeLetter(),
			font = {
				size: Math.floor(radius),
				weight: 'bold'
			};

		ctx.save();
		try {

			ctx.setTransform(1, 0, 0, 1, centerX, centerY);
			ctx.beginPath();
			ctx.arc(0, 0, radius, 0, 2 * Math.PI, false);

			ctx.shadowColor = '#666';
			ctx.shadowBlur = 5;
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 1;

			ctx.fillStyle = this.getColor();
			ctx.fill();

			ctx.setTransform(1, 0, 0, 1, centerX, centerY);
			ctx.fillStyle = '#fff';

			this.setFont(font);
			textbox = ctx.measureText(grade);

			ctx.shadowOffsetX = -1;
			ctx.shadowOffsetY = -1;

			ctx.fillText(grade, Math.floor(-textbox.width / 2) + 2, font.size / 3);
		} finally {
			ctx.restore();
		}
	}
});
