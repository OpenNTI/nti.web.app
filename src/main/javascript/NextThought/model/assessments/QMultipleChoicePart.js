Ext.define('NextThought.model.assessments.QMultipleChoicePart', {
	extend: 'NextThought.model.assessments.QPart',
	fields: [
		{ name: 'solutions', type: 'auto' },
		{ name: 'choices', type: 'auto' }
	]
});
