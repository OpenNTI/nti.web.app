var Ext = require('extjs');
var ModelBase = require('./Base');
var ModelQuizQuestionResponse = require('./QuizQuestionResponse');


module.exports = exports = Ext.define('NextThought.model.QuizResult', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'QuizID', type: 'string' },
		{ name: 'Items', type: 'arrayItem' }
	]
});
