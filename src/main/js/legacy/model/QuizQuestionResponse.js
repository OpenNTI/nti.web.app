const Ext = require('extjs');

require('./Base');
require('./QuizQuestion');


module.exports = exports = Ext.define('NextThought.model.QuizQuestionResponse', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Assessment', type: 'boolean' },
		{ name: 'Question', type: 'singleItem'},
		{ name: 'Response', type: 'string' }
	],

	proxy: {
		type: 'memory'
	}
});
