export default Ext.define('NextThought.model.assessment.PollSubmission', {
	extend: 'NextThought.model.assessment.QuestionSubmission',
	mimeType: 'application/vnd.nextthought.assessment.pollsubmission',


	fields: [
		{name: 'pollId', type: 'String'}
	]
});
