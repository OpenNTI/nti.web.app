Ext.define('NextThought.model.assessment.Survey', {
	extend: 'NextThought.model.assessment.QuestionSet',
	mimeType: 'application/vnd.nextthought.nasurvey',

	isSurvey: true,

	fields: [
		{name: 'isClosed', type: 'Boolean'},
		{name: 'submissions', type: 'Number'}
	]
});
