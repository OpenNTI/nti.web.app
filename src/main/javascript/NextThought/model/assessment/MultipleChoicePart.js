Ext.define('NextThought.model.assessment.MultipleChoicePart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
});
