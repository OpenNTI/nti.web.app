Ext.define('NextThought.model.assessments.MultipleChoicePart', {
	extend: 'NextThought.model.assessments.Part',
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
});
