Ext.define('NextThought.model.assessment.QuestionSetSubmission', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'questionSetId', type: 'string' },
		{ name: 'questions', type: 'arrayItem' }
	]
});
