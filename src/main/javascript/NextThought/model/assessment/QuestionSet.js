Ext.define('NextThought.model.assessment.QuestionSet', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'questions', type: 'arrayItem' }
	]
});
