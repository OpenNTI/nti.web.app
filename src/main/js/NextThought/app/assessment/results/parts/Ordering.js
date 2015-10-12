Ext.define('NextThought.app.assessment.results.parts.Ordering', {
	extend: 'NextThought.app.assessment.results.parts.Matching',
	alias: 'widget.assessment-results-ordering',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedorderingpart'
	},

	getRowLabels: function() {
		return this.questionPart.get('labels');
	},


	getSeriesLabels: function() {
		return this.questionPart.get('values');
	}
});
