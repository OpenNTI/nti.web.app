Ext.define('NextThought.model.QuizResult', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.QuizQuestionResponse'
	],
	fields: [
		{ name: 'QuizID', type: 'string' },
		{ name: 'Items', type: 'arrayItem' }
	]
});
