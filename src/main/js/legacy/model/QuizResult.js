const Ext = require('extjs');

require('./Base');
require('./QuizQuestionResponse');


module.exports = exports = Ext.define('NextThought.model.QuizResult', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'QuizID', type: 'string' },
		{ name: 'Items', type: 'arrayItem' }
	]
});
