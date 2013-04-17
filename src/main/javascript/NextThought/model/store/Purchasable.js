Ext.define('NextThought.model.store.Purchasable', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.store.StripeConnectKey'
	],

	fields: [
		{ name: 'Amount', type: 'int', persist: false }, //Amount in cents (which may not make sense for all currencies, need to check with carlos)
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'BulkPurchase', type: 'bool', persist: false },
		{ name: 'Discountable', type: 'bool', persist: false },
		{ name: 'Provider', type: 'string', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Icon', type: 'string', persist: false },
		{ name: 'Description', type: 'string', persist: false },
		{ name: 'StripeConnectKey', type: 'singleitem', persist: false }
	]
});