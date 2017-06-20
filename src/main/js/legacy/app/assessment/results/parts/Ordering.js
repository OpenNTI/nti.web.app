const Ext = require('extjs');

require('./Matching');


module.exports = exports = Ext.define('NextThought.app.assessment.results.parts.Ordering', {
	extend: 'NextThought.app.assessment.results.parts.Matching',
	alias: 'widget.assessment-results-ordering',

	statics: {
		mimeType: 'application/vnd.nextthought.assessment.aggregatedorderingpart'
	},

	cls: 'result-part',

	getRowLabels: function () {
		return this.questionPart.get('labels');
	},


	getSeriesLabels: function () {
		return this.questionPart.get('values');
	},

	/**
	 * See Comment in NextThought.app.assessment.results.parts.Matching
	 * @return {Object} Map of results
	 */
	getResults: function () {
		return this.resultPart.Results;
	}
});
