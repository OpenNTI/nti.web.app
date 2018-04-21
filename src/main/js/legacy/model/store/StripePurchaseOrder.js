const Ext = require('@nti/extjs');

require('../Base');
require('./StripePurchaseItem');


module.exports = exports = Ext.define('NextThought.model.store.StripePurchaseOrder', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Coupon', type: 'auto', persist: false, defaultValue: undefined},
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'Quantity', type: 'int', persist: false },
		{ name: 'Items', type: 'arrayitem', persist: false}
	]
});
