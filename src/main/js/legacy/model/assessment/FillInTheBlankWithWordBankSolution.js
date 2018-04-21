const Ext = require('@nti/extjs');

require('./Solution');
require('./WordBank');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankSolution', {
	extend: 'NextThought.model.assessment.Solution',

	fields: [
		{ name: 'value', type: 'auto' }
	]
});
