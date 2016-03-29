var Ext = require('extjs');
var ModelBase = require('../Base');


module.exports = exports = Ext.define('NextThought.model.assessment.AssignmentSubmissionPendingAssessment', {
	extend: 'NextThought.model.Base',
	fields: [
		{name: 'assignmentId', type: 'string'},
		{name: 'parts', type: 'arrayItem'},
		{name: 'CreatorRecordedEffortDuration', type: 'int'}
	],


	getCorrectCount: function () {
		function sum (agg, r) {
			return agg + (r.getCorrectCount ? r.getCorrectCount() : 0);
		}
		return (this.get('parts') || []).reduce(sum, 0);
	}
});
