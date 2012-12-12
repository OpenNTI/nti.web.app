Ext.define('NextThought.model.assessment.MultipleChoiceMultipleAnswerPart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		{ name: 'solutions', type: 'arrayItem' },
		{ name: 'choices', type: 'auto' }
	]
});
