Ext.define('NextThought.model.assessment.QuestionSubmission', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'auto' },
		{ name: 'CreatorRecordedEffortDuration', type: 'int' }
	],

	isCorrect: function() { return null; }
});
