var Ext = require('extjs');
var ModelBase = require('../Base');
var AssessmentPollSubmission = require('./PollSubmission');


module.exports = exports = Ext.define('NextThought.model.assessment.UsersCourseInquiryItem', {
    extend: 'NextThought.model.Base',

    fields: [
		{name: 'Submission', type: 'singleItem'}
	]
});
