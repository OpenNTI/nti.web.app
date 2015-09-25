export default Ext.define('NextThought.model.assessment.QuestionSetSubmission', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.Items',
		'NextThought.util.Parsing'
	],
	isSet: true,
	fields: [
		{ name: 'questionSetId', type: 'string' },
		{ name: 'questions', type: 'arrayItem' },
		{ name: 'CreatorRecordedEffortDuration', type: 'int' }
	]
});
