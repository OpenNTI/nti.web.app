Ext.define('NextThought.model.store.StripePricedPurchasable', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Coupon', type: 'auto', persist: false, defaultValue: undefined},
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'Provider', type: 'string', persist: false },
		{ name: 'PurchasePrice', type: 'float', persist: false },
		{ name: 'NonDiscountedPrice', type: 'float', persist: false, useNull: true, defaultValue: undefined },
		{ name: 'Quantity', type: 'int', persist: false }
	],

	isPricedPurchase: true
});
