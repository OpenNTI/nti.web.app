Ext.define('NextThought.model.store.PricingResults', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.store.StripePricedPurchasable'
	],

	fields: [
		{ name: 'TotalPurchasePrice', type: 'float', persist: false },
		{ name: 'TotalNonDiscountedPrice', type: 'float', persist: false },
		{ name: 'Items', type: 'arrayitem', persist: false}
	]
});
