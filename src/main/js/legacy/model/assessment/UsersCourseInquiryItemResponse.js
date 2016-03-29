var Ext = require('extjs');
var ModelBase = require('../Base');
var AssessmentSurveySubmission = require('./SurveySubmission');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseInquiryItemResponse', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.userscourseinquiryitemresponse',

	fields: [
		{name: 'Aggregated', type: 'auto'},
		{name: 'Submission', type: 'singleItem'}
	]
});
