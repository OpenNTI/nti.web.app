const Ext = require('extjs');

require('./QuestionSubmission');


module.exports = exports = Ext.define('NextThought.model.assessment.PollSubmission', {
	extend: 'NextThought.model.assessment.QuestionSubmission',
	mimeType: 'application/vnd.nextthought.assessment.pollsubmission',


	fields: [
		{name: 'pollId', type: 'String'},
		{name: 'version', type: 'string'}
	]
});
