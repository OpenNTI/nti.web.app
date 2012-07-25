Ext.define('NextThought.model.assessments.AssessedQuestionSet', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'questions', type: 'auto' },
		{ name: 'questionSetId', type: 'string' }
	]
});
