Ext.define('NextThought.model.assessments.AssessedQuestionSet', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'questions', type: 'arrayItem' },
		{ name: 'questionSetId', type: 'string' }
	]
});
