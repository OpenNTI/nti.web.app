Ext.define('NextThought.model.store.StripePurchaseError', {
	alternateClassName: 'NextThought.model.store.PurchaseError',
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Code', type: 'string', persist: false },
		{ name: 'HttpStatus', type: 'int', persist: false },
		{ name: 'Message', type: 'string', persist: false },
		{ name: 'Param', type: 'string', persist: false },
		{ name: 'Type', type: 'string', persist: false }
	]
});
