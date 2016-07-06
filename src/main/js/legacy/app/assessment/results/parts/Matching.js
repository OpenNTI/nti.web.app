var Ext = require('extjs');
var PartsBarChart = require('./BarChart');
var PartsTable = require('./Table');


module.exports = exports = Ext.define('NextThought.app.assessment.results.parts.Matching', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-matching-results',
	cls: 'result-part',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmatchingpart'
	},

	items: [],

	initComponent: function () {
		this.callParent(arguments);
		
		if (!this.resultPart.Total) {
			this.add({
				xtype: 'box',
				autoEl: {cls: 'message', html: 'This question was not answered.'}
			});

			return;
		}

		this.tabBar = this.add({
			xtype: 'container',
			layout: 'none',
			cls: 'tab-bar',
			items: []
		});


		this.tableTab = this.tabBar.add({
			xtype: 'box',
			autoEl: {cls: 'tab', html: 'Table'},
			listeners: {
				click: {
					element: 'el',
					fn: this.showTable.bind(this)
				}
			}
		});


		this.chartTab = this.tabBar.add({
			xtype: 'box',
			autoEl: {cls: 'tab active', html: 'Bar Chart'},
			listeners: {
				click: {
					element: 'el',
					fn: this.showChart.bind(this)
				}
			}
		});


		this.barChart = this.add({
			xtype: 'assessment-barchart-results',
			axis: this.getAxis()
		});

		this.table = this.add({
			xtype: 'assessment-table-results',
			table: this.getTable()
		});

		this.table.hide();
		this.barChart.show();
	},

	getRowLabels: function () {
		return this.questionPart.get('values');
	},

	getSeriesLabels: function () {
		return this.questionPart.get('labels');
	},

	/**
	 * The Results coming back look like:
	 *
	 * {
	 *	labelIndex: {
	 *		valueIndex: number of times this value was placed with this label
	 *	}
	 * }
	 *
	 * For graphing the results, we are trying to make the axis labels be the
	 * parts that are fixed in the question, and the values be the parts that
	 * the user can move. For ordering, the results work as is, since the labels
	 * are what stays still and the values are movable. However for matching, its
	 * the reverse (values stay still, while the labels move). So to get them to
	 * line up, for matching we need to inverse the results to look like:
	 *
	 * {
	 *	valueIndex: {
	 *		labelIndex: number of times this label was placed with this value
	 *	}
	 * }
	 *
	 * @return {Object} Map of the results
	 */
	getResults: function () {
		var oldResults = this.resultPart.Results,
			newResults = {},
			resultKeys = Object.keys(oldResults);

		resultKeys.forEach(function (labelIdx) {
			var result = oldResults[labelIdx],
				keys = Object.keys(result);

			keys.forEach(function (valueIdx) {
				newResults[valueIdx] = newResults[valueIdx] || {};

				newResults[valueIdx][labelIdx] = oldResults[labelIdx][valueIdx];
			});
		});

		return newResults;
	},

	/**
	 * Return an array of rows to pass to the bar chart.
	 * See the comments in NextThought.app.assessment.results.parts.MultiChoice
	 * for more explanation of why its structured this way.
	 *
	 * @return {Array} the rows to show in the bar chart.
	 */
	getAxis: function () {
		var resultParts = this.getResults(),
			total = this.resultPart.Total,
			rowLabels = this.getRowLabels(),
			seriesLabels = this.getSeriesLabels(),
			d = document.createElement('div'),
			axis = [];

		function clean (text) {
			d.innerHTML = text;
			return d.textContent;
		}

		rowLabels.forEach(function (value, valueIndex) {
			var valueResult = resultParts[valueIndex],
				row = {
					label: clean(value),
					series: []
				};

			seriesLabels.forEach(function (label, labelIndex) {
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
	},

	getTable: function () {
		var resultParts = this.getResults(),
			total = this.resultPart.Total,
			rowLabels = this.getRowLabels(),
			seriesLabels = this.getSeriesLabels(),
			d = document.createElement('div'),
			rows = [];

		function clean (text) {
			d.innerHTML = text;
			return d.textContent;
		}

		rowLabels.forEach(function (value, valueIndex) {
			var valueResult = resultParts[valueIndex],
				row = [clean(value)];

			seriesLabels.forEach(function (label, labelIndex) {
				var labelResult = valueResult[labelIndex];

				row.push(labelResult || 0);
			});

			rows.push(row);
		});


		return {
			header: seriesLabels.reduce(function (acc, label) {
				acc.push(clean(label));

				return acc;
			}, ['']),
			rows: rows
		};
	},

	showTable: function () {
		this.barChart.hide();
		this.table.show();

		this.tableTab.addCls('active');
		this.chartTab.removeCls('active');
	},

	showChart: function () {
		this.table.hide();
		this.barChart.show();

		this.chartTab.addCls('active');
		this.tableTab.removeCls('active');
	}
});
