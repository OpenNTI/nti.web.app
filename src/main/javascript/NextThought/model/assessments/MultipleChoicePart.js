Ext.define('NextThought.model.assessments.MultipleChoicePart', {
	extend: 'NextThought.model.assessments.Part',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
});
