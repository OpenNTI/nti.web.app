const Ext = require('@nti/extjs');
require('internal/legacy/model/Base');

module.exports = exports = Ext.define(
	'NextThought.model.assessment.QuestionSetSubmission',
	{
		extend: 'NextThought.model.Base',
		isSet: true,

		fields: [
			{ name: 'questionSetId', type: 'string' },
			{ name: 'questions', type: 'arrayItem' },
			{ name: 'CreatorRecordedEffortDuration', type: 'int' },
		],
	}
);
