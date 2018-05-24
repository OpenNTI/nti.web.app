const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CourseAwardableCredit', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.credit.courseawardablecredit',

	fields: [
		{ name: 'amount', type: 'number' },
		{ name: 'title', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'credit_definition', type: 'singleItem' },
		{ name: 'issuer', type: 'string' },
		{ name: 'awarded_date', type: 'ISODate' }
	]
});
