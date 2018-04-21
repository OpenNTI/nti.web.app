const Ext = require('@nti/extjs');

require('../Base');
require('./StripePricedPurchasable');


module.exports = exports = Ext.define('NextThought.model.store.PricingResults', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'TotalPurchasePrice', type: 'float', persist: false },
		{ name: 'TotalNonDiscountedPrice', type: 'float', persist: false },
		{ name: 'Items', type: 'arrayitem', persist: false}
	]
});
