var Ext = require('extjs');
var ChartScore = require('../../common/chart/Score');


module.exports = exports = Ext.define('NextThought.app.assessment.Score', {
    extend: 'Ext.container.Container',
    alias: 'widget.assessment-score',
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
			xtype: 'chart-score',
			store: this.store,
			shadow: false,
			legend: false
		});

		this.setValue(this.value || 0);
	},

    setValue: function(value) {
		var v = value || 4,
			data = [{p: v},{p: (100 - v)}],
			c = this.down('chart-score').setValue(value);
	}
});
