Ext.define('NextThought.app.assessment.results.parts.Matching', {
	extend: 'Ext.container.Container',
	alias: 'widget.assessment-matching-results',

	requires: [
		'NextThought.app.assessment.results.parts.BarChart'
	],

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedmultiplechoicepart'
	},

	initComponent: function() {
		this.callParent(arguments);

		this.barChart = this.add({
			xtype: 'assessment-barchart-results',
			axis: this.getAxis()
		});
	},


	getAxis: function() {
		debugger;
	}
});
