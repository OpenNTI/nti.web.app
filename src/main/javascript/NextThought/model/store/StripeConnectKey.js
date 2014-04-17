Ext.define('NextThought.model.store.StripeConnectKey', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.stripeconnectkey',

	fields: [
		{ name: 'Alias', type: 'auto', persist: false },
		{ name: 'LiveMode', type: 'bool', persist: false },
		{ name: 'PublicKey', type: 'auto', persist: false },
		{ name: 'StripeUserID', type: 'auto', persist: false }
	]
});
