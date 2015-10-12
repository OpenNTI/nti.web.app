Ext.define('NextThought.app.assessment.results.parts.Matching', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-matching-results',

	requires: [
		'NextThought.app.assessment.results.parts.BarChart'
	],

	cls: 'result-part',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmatchingpart'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.barChart = this.add({
			xtype: 'assessment-barchart-results',
			axis: this.getAxis()
		});
	},


	getRowLabels: function() {
		return this.questionPart.get('values');
	},


	getSeriesLabels: function() {
		return this.questionPart.get('labels');
	},


	getAxis: function() {
		var resultParts = this.resultPart.Results,
			total = this.resultPart.Total,
			rowLabels = this.getRowLabels(),
			seriesLabels = this.getSeriesLabels(),
			d = document.createElement('div'),
			axis = [];

		function clean(text) {
			d.innerHTML = text;
			return d.innerText;
		}

		rowLabels.forEach(function(value, valueIndex) {
			var valueResult = resultParts[valueIndex],
				row = {
					label: clean(value),
					series: []
				};

			seriesLabels.forEach(function(label, labelIndex) {
				var labelResult = valueResult[labelIndex];

				if (labelResult) {
					row.series.push({
						count: labelResult,
						percent: (labelResult / total) * 100,
						label: clean(label),
						sublabel: labelResult + ' out of ' + total
					});
				}
			});

			axis.push(row);

		});

		return axis;
	}
});
