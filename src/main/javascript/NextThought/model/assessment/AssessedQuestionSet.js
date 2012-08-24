Ext.define('NextThought.model.assessment.AssessedQuestionSet', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	idProperty: 'questionSetId',
	isSet: true,

	fields: [
		{ name: 'questions', type: 'arrayItem' },
		{ name: 'questionSetId', type: 'string' }
	]
});
