Ext.define('NextThought.model.assessments.QuestionSubmission', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'arrayItem' }
	]
});
