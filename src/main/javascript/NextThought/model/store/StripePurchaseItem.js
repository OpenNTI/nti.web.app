Ext.define('NextThought.model.store.StripePurchaseItem', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Coupon', type: 'auto', persist: false, defaultValue: undefined},
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'Quantity', type: 'int', persist: false }
	]
});