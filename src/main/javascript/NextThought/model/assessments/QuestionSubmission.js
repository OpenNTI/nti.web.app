Ext.define('NextThought.model.assessments.QuestionSubmission', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'auto' }
	]
});
