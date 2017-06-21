const Ext = require('extjs');

require('../Base');
require('./SurveySubmission');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseInquiryItemResponse', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.assessment.userscourseinquiryitemresponse',

	fields: [
		{name: 'Aggregated', type: 'auto'},
		{name: 'Submission', type: 'singleItem'}
	]
});
