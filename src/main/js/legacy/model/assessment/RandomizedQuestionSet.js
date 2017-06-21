const Ext = require('extjs');

require('./QuestionSet');


module.exports = exports = Ext.define('NextThought.model.assessment.RandomizedQuestionSet', {
	extend: 'NextThought.model.assessment.QuestionSet',
	mimeType: 'application/vnd.nextthought.narandomizedquestionset'
});
