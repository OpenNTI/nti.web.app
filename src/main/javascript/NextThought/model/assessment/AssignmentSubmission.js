Ext.define('NextThought.model.assessment.AssignmentSubmission', {
	extend: 'NextThought.model.Base',
	fields: [
		{name: 'assignmentId', type: 'string'},
		{name: 'parts', type: 'arrayItem'},
		{name: 'CreatorRecordedEffortDuration', type: 'int', defaultValue: 180}
	]
});
