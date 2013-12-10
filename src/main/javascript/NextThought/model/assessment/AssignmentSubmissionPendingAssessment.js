Ext.define('NextThought.model.assessment.AssignmentSubmissionPendingAssessment', {
	extend: 'NextThought.model.Base',
	fields: [
		{name: 'assignmentId', type: 'string'},
		{name: 'parts', type: 'arrayItem'}
	]
});
