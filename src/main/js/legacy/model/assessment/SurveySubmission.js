var Ext = require('extjs');
var AssessmentQuestionSetSubmission = require('./QuestionSetSubmission');


module.exports = exports = Ext.define('NextThought.model.assessment.SurveySubmission', {
	extend: 'NextThought.model.assessment.QuestionSetSubmission',
	mimeType: 'application/vnd.nextthought.assessment.surveysubmission',

	fields: [
		{name: 'surveyId', type: 'String'}
	]
});
