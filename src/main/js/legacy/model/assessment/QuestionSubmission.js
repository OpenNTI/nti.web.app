const Ext = require('extjs');
require('legacy/model/Base');


module.exports = exports = Ext.define('NextThought.model.assessment.QuestionSubmission', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'questionId', type: 'string' },
		{ name: 'parts', type: 'auto' },
		{ name: 'CreatorRecordedEffortDuration', type: 'int' }
	],

	isCorrect: function () { return null; }
});
