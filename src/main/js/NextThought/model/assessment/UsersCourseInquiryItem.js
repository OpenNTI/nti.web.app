Ext.define('NextThought.model.assessment.UsersCourseInquiryItem', {
	extend: 'NextThought.model.Base',

	requires: ['NextThought.model.assessment.PollSubmission'],

	fields: [
		{name: 'Submission', type: 'singleItem'}
	]
});
