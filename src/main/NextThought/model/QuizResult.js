Ext.define('NextThought.model.QuizResult', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.Rest',
		'NextThought.model.QuizQuestionResponse'
	],
	fields: [
		{ name: 'Class', type: 'string', defaultValue: 'QuizResult' },
		{ name: 'QuizID', type: 'string' },
		{ name: 'ContainerId', type: 'string' },
		{ name: 'Creator', type: 'string' },
		{ name: 'Items', type: 'arrayItem' }
	],
	proxy: {
		type: 'nti',
		model: 'NextThought.model.QuizResult'
	},
	getModelName: function() {
		return 'QuizResult';
	}
});
