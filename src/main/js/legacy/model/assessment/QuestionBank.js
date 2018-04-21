const Ext = require('@nti/extjs');

require('./QuestionSet');


module.exports = exports = Ext.define('NextThought.model.assessment.QuestionBank', {
	extend: 'NextThought.model.assessment.QuestionSet',
	mimeType: 'application/vnd.nextthought.naquestionbank',

	fields: [
		{ name: 'draw', type: 'int' }
	]
});
