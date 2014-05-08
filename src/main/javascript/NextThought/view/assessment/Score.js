Ext.define('NextThought.view.assessment.Score', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-score',
	requires: [
		'Ext.data.JsonStore',
		'Ext.chart.Chart',
		'NextThought.chart.series.Score'
	],

	correctColor: '#a5c959',
	incorrectColor: '#d9d9d9',
	textColor: '#7fab22',
	chartStyle: {
		'stroke-width': 2,
		'stroke-opacity': 1,
		stroke: '#fff'
	},

	initComponent: function() {
		this.store = Ext.data.JsonStore.create({fields: ['p']});
		this.callParent(arguments);
		this.add({
			xtype: 'chart',
			width: 75,
			height: 75,
			animate: true,

			store: this.store,
			insetPadding: 10,
			shadow: false,
			legend: false,

			series: [{
				 type: 'score',
				 angleField: 'p',
				 correctColor: this.correctColor,
				 incorrectColor: this.incorrectColor,
				 textColor: this.textColor,
				 style: this.chartStyle
			 }]
		});

		this.setValue(this.value || 0);
	},


	setValue: function(value) {
		var v = value || 4,
			data = [{p: v},{p: (100 - v)}],
			c = this.down('chart'),
			s = c.series.first(),
			store = this.store;

		if (s.setValue) {
			s.setValue(value);
		}
		else {
			s.scoreValue = value;
		}

		this.value = value;

		//if (value === 0){ data.shift(); }

		Ext.defer(function() {
			store.loadRawData(data, false);
			try {
				if (c.rendered) {c.redraw();}
			} catch (e) {
				Error.raiseForReport(e.stack || e.message || e);
			}
		},1);
	}
});
