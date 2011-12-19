Ext.define('NextThought.model.QuizResult', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest',
		'NextThought.model.QuizQuestionResponse'
	],
	fields: [
		{ name: 'QuizID', type: 'string' },
		{ name: 'Items', type: 'arrayItem' }
	],
	proxy: {
		type: 'nti',
		model: 'NextThought.model.QuizResult'
	}
});
