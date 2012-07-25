Ext.define('NextThought.model.assessments.QuestionSet', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'questions', type: 'arrayItem' }
	]
});
