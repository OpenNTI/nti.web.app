Ext.define('NextThought.model.store.StripeConnectKey', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Alias', type: 'auto', persist: false },
		{ name: 'LiveMode', type: 'bool', persist: false },
		{ name: 'PublicKey', type: 'auto', persist: false },
		{ name: 'StripeUserID', type: 'auto', persist: false }
	]
});
