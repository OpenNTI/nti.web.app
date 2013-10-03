Ext.define('NextThought.chart.series.Score', {
	extend: 'Ext.chart.series.Pie',
	alias: 'series.score',

	donut: 65,
	correctColor: '#a5c959',
	incorrectColor: '#d9d9d9',
	textColor: '#7fab22',
	colorSet: [],
	style: {
		'stroke-width': 2,
		'stroke-opacity': 1,
		stroke: '#fff'
	},


	setValue: function(value) {
		this.scoreValue = value;
	},


	drawSeries: function() {
		//TODO: try to figure out why animations mess up the overridden getSegment values :/
		this.chart.animate = false;

		if (this.chart.getChartStore().getCount() < 2) {
			this.colorSet = [this.incorrectColor];
		}
		else {
			this.colorSet = [this.correctColor, this.incorrectColor];
		}

		delete this.correctionOffset;
		this.callParent(arguments);

		var val = this.scoreValue,
			label = this.scoreLabel;

		if (!label) {
			label = this.scoreLabel = this.chart.surface.add({
		        type: 'text',
		        text: '',
		        fill: this.textColor,
		        font: 'normal 400 14px "Open Sans", Verdana',
				'text-anchor': 'middle',
				x: this.centerX + 2,
				y: this.centerY + 1
		    });
		}

		try {
			label.setAttributes({
				text: val + (val >= 100 ? '' : '\u008C%'),
				fill: val === 0 ? this.incorrectColor : this.textColor,
				x: this.centerX + (val >= 100 ? 0 : 2),
				y: this.centerY + 1
			});

			label.show(true);
		}
		catch (er) {
			console.error(er.message);
		}
	},


	getSegment: function(opt) {
		var desiredAngle,
			r,
			abs,
			sign,
			//key = 'angles adjusted to start at -PI/2',
			delta = this.correctionOffset;

		if (delta === undefined) {
			desiredAngle = Math.PI / 2;
			r = opt.endAngle * this.rad;
			abs = Math.abs(r);
			sign = r / abs;
			delta = (sign * (abs - desiredAngle) / this.rad) || desiredAngle;
			this.correctionOffset = delta;
		}

		if (this.scoreValue === 0 && this.chart.getChartStore().getCount() > 1) {
			delta += 1500;
		}

    //		if(delta && !opt.hasOwnProperty(key)){
    //			opt[key] = true;
			opt.endAngle -= delta;
			opt.startAngle -= delta;
    //		}

		return this.callParent(arguments);
	}
});
