Ext.define('NextThought.model.QuizQuestionResponse', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.QuizQuestion'
	],
	fields: [
		{ name: 'Assessment', type: 'boolean' },
		{ name: 'Question', type: 'singleItem'},
		{ name: 'Response', type: 'string' }
	],
	proxy: {
		type: 'memory'
	}
});
