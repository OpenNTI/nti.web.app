const Ext = require('@nti/extjs');

require('./Part');
require('./WordBank');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankWithWordBankPart', {
	extend: 'NextThought.model.assessment.Part',

	fields: [
		{ name: 'input', type: 'string' },
		{ name: 'wordbank', type: 'singleItem' }
	]
});
