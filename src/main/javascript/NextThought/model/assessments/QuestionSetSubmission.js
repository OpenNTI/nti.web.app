Ext.define('NextThought.model.assessments.QuestionSetSubmission', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'questionSetId', type: 'string' },
		{ name: 'questions', type: 'auto' }
	]
});
