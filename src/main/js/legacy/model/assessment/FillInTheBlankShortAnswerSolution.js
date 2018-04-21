const Ext = require('@nti/extjs');

require('./FreeResponseSolution');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankShortAnswerSolution', {
	extend: 'NextThought.model.assessment.FreeResponseSolution',
	fields: [
		{ name: 'value', type: 'auto' }
	]
});
