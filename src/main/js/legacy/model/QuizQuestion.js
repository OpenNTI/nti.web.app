const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.QuizQuestion', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'Answers', type: 'auto' },
		{ name: 'Class', type: 'string' },
		{ name: 'Text', type: 'auto' }
	],
	proxy: {
		type: 'memory'
	}
});
