const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CreditDefinition', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.credit.creditdefinition',

	fields: [
		{ name: 'credit_type', type: 'string' },
		{ name: 'credit_units', type: 'string' }
	]
});
