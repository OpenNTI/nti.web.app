Ext.define('NextThought.model.QuizResult', {
    extend: 'NextThought.model.Base',
	requires: [
		'NextThought.proxy.RestMimeAware',
		'NextThought.model.QuizQuestionResponse'
	],
	idProperty: 'OID',
	fields: [
		{ name: 'id', mapping: 'ID', type: 'int' },
		{ name: 'OID', type: 'string' },
		{ name: 'Class', type: 'string' },
		{ name: 'QuizID', type: 'string' },
		{ name: 'ContainerId', type: 'string' },
		{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'Creator', type: 'string' },
		{ name: 'Items', type: 'arrayItem' }
	],
	proxy: {
		type: 'nti-mimetype',
		model: 'NextThought.model.QuizResult'
	},
	getModelName: function() {
		return 'QuizResult';
	}
});
