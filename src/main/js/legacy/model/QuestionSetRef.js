const Ext = require('@nti/extjs');
require('./RelatedWork');


module.exports = exports = Ext.define('NextThought.model.QuestionSetRef', {
	extend: 'NextThought.model.RelatedWork',

	fields: [
		{name: 'question-count', type: 'string'}
	]
});
