Ext.define('NextThought.model.assessment.AssignmentSubmission', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.ssignmentsubmission',
	fields: [
		{name: 'assignmentId', type: 'string'},
		{name: 'parts', type: 'arrayItem'}
	]
});
