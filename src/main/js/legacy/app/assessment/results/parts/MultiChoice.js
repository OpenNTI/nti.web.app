var Ext = require('extjs');
var PartsBarChart = require('./BarChart');


module.exports = exports = Ext.define('NextThought.app.assessment.results.parts.MultiChoice', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-multichoice-result',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmultiplechoicepart'
	},

	cls: 'result-part',

	initComponent: function () {
		this.callParent(arguments);

		this.barChart = this.add({
			xtype: 'assessment-barchart-results',
			axis: this.getAxis()
		});
	},

	/**
	 * Get the rows to pass to the bar chart.
	 *
	 * The results we get back look like:
	 *
	 * {
	 *	choiceIndex: number of times it was chosen
	 * }
	 *
	 * To map this to the labels, we iterate the choices listed in the question.
	 * Since there may be no results for a choice, doing this will ensure we have
	 * rows for every choice.
	 *
	 * @return {Array} Rows to pass to the bar chart
	 */
	getAxis: function () {
		var resultParts = this.resultPart.Results,
			total = this.resultPart.Total,
			choices = this.questionPart.get('choices'),
			d = document.createElement('div'),
			axis = [];

		function clean (text) {
			d.innerHTML = text;
			return d.textContent;
		}

		choices.forEach(function (choice, idx) {
			var result = resultParts[idx],
				row = {
					labelPrefix: String.fromCharCode(65 + idx) + '.',
					label: clean(choice),
					series: []
				};

			if (result) {
				row.series.push({
					percent: (result / total) * 100,
					count: result,
					sublabel: result + ' out of ' + total
				});
			}

			axis.push(row);
		});

		return axis;
	}
});
