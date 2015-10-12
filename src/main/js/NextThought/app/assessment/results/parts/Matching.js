Ext.define('NextThought.app.assessment.results.parts.Matching', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-matching-results',

	requires: [
		'NextThought.app.assessment.results.parts.BarChart',
		'NextThought.app.assessment.results.parts.Table'
	],

	cls: 'result-part',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmatchingpart'
	},

	items: [],

	initComponent: function() {
		this.callParent(arguments);

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
			return d.textContent;
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
	},


	getTable: function() {
		var resultParts = this.resultPart.Results,
			total = this.resultPart.Total,
			rowLabels = this.getRowLabels(),
			seriesLabels = this.getSeriesLabels(),
			d = document.createElement('div'),
			rows = [];

		function clean(text) {
			d.innerHTML = text;
			return d.textContent;
		}

		rowLabels.forEach(function(value, valueIndex) {
			var valueResult = resultParts[valueIndex],
				row = [clean(value)];

			seriesLabels.forEach(function(label, labelIndex) {
				var labelResult = valueResult[labelIndex];

				row.push(labelResult || 0);
			});

			rows.push(row);
		});


		return {
			header: seriesLabels.reduce(function(acc, label) {
				acc.push(clean(label));

				return acc;
			}, ['']),
			rows: rows
		};
	},


	showTable: function() {
		this.barChart.hide();
		this.table.show();

		this.tableTab.addCls('active');
		this.chartTab.removeCls('active');
	},


	showChart: function() {
		this.table.hide();
		this.barChart.show();

		this.chartTab.addCls('active');
		this.tableTab.removeCls('active');
	}
});
