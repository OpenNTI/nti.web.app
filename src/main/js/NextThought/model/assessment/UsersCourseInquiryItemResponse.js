Ext.define('NextThought.model.assessment.UsersCourseInquiryItemResponse', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.userscourseinquiryitemresponse',

	requires: ['NextThought.model.assessment.SurveySubmission'],

	fields: [
		{name: 'Aggregated', type: 'auto'},
		{name: 'Submission', type: 'singleItem'}
	]
});
