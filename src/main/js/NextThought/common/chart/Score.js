export default Ext.define('NextThought.common.chart.Score', {
	extend:	'Ext.Component',
	alias: 'widget.chart-score',
	ui: 'course-assessment',
	cls: 'score',

	autoEl: {
		tag: 'canvas',
		style: {width: '75px', height: 'auto'}
	},


	config: {
		title: '',
		colors: ['#a5c959','#d9d9d9'],
		pixelDensity: 2,
		score: 0
	},

	getInitialState: function() {
		//FIXME: Re-write this:
		// See: http://facebook.github.io/react/tips/props-in-getInitialState-as-anti-pattern.html
		// Additional Note: On Mount and Recieve Props fill state (this is ment to be called one per CLASS lifetime not Instance lifetime)

		var score = parseInt(this.score, 10);
		return {
			series: [
				{value: score, label: 'Score'},
				{value: 100 - score, label: ''}
			]
		};
	},


	getCanvas: function() {
		return this.el.dom;
	},


	afterRender: function() {
		/*
		var canvas = this.getCanvas();
		var context = canvas.getContext('2d');

		context.imageSmoothingEnabled = true;

		this.paint(context);
		*/
		this.callParent(arguments);
		this.state = this.getInitialState();
		this.canvas = this.getCanvas();
		this.viewWidth = 75;// this.el.getWidth();
		this.viewHeight = 75;//this.el.getHeight();
		this.canvas.width = this.viewWidth * this.getPixelDensity();
		this.canvas.height = this.viewHeight * this.getPixelDensity();
		this.context = this.canvas.getContext('2d');
		this.context.imageSmoothingEnabled = true;

		this.paint(this.context);
	},

	paint: function(ctx) {
		var centerX = ctx.canvas.width / 2,
			centerY = ctx.canvas.height / 2,
			len = this.state.series.length, i = 0;

		ctx.canvas.width += 0; //set the canvas dirty and make it clear on next draw.

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
				this.drawSegment(ctx, i);
			}

			this.drawLabel(ctx);

		} finally {
			ctx.restore();
		}
	},


	getTotal: function() {
		return this.state.series.reduce(function(sum, i) {return sum + i.value; }, 0);
	},

	drawSegment: function(ctx, i) {
		var radius = Math.floor(ctx.canvas.width * 0.4),
			series = this.state.series[i].value,
			total = this.getTotal(),

			percent = series / total,

			startingAngle = this.percentToRadians(this.sumTo(this.state.series, i) / total),

			arcSize = this.percentToRadians(percent),

			endingAngle = startingAngle + arcSize,
			endingRadius = radius * 0.7;

		ctx.save();

		ctx.beginPath();

		ctx.moveTo(endingRadius * Math.cos(startingAngle),
					endingRadius * Math.sin(startingAngle));

		ctx.arc(0, 0, radius, startingAngle, endingAngle, false);
		ctx.arc(0, 0, endingRadius, endingAngle, startingAngle, true);

		ctx.closePath();

		ctx.fillStyle = this.colors[i % this.colors.length];
		ctx.fill();

		ctx.lineWidth = 5;
		ctx.globalCompositeOperation = 'destination-out';
		ctx.strokeStyle = '#000';
		ctx.stroke();

		ctx.restore();
	},


	drawLabel: function(ctx) {
		try {
			var centerX = ctx.canvas.width / 2,
				centerY = ctx.canvas.height / 2,
				radius = Math.floor(ctx.canvas.width * 0.4) * 0.75,
				textbox,
				score = parseInt(this.score, 10),
				font = {
					size: Math.floor(radius/1.5),
					weight: 600
				};

			ctx.save();

			ctx.fillStyle = !score ? this.colors[1] : '#7fab22';
			ctx.lineWidth = 0;
			ctx.setTransform(1, 0, 0, 1, centerX, centerY);
			this.setFont(ctx, font);

			score += '%';
			textbox = ctx.measureText(score);
			ctx.globalAlpha = 0.8;
			ctx.fillText(score, -textbox.width / 2, font.size / 3);
		}
		finally {
			ctx.restore();
		}
	},


	sumTo: function(data, i) {
		var sum = 0, j = 0;
		for (j; j < i; j++) {
			sum += data[j].value;
		}
		return sum;
	},


	percentToRadians: function(percent) { return ((percent * 360) * Math.PI) / 180; },


	setFont: function(context, font) {
		context.font = [
			font.style || 'normal',
			font.variant || 'normal',
			font.weight || 'normal', (font.size || 10) + 'px',
			font.family || '"Open Sans"'
		].join(' ');
	},

	setValue: function(score) {
		if (!this.rendered) {
			this.on('afterrender', this.setValue.bind(this, score));
			return;
		}

		var me = this;

		me.score = score;
		me.state = {
			series: [
				{value: score, label: 'Score'},
				{value: 100 - score, label: ''}
			]
		};

		wait()
			.then(function() {
				me.paint(me.context);
			});
	}
});
