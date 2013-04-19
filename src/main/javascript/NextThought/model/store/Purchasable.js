Ext.define('NextThought.model.store.Purchasable', {
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.store.StripeConnectKey'
	],

	fields: [
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'BulkPurchase', type: 'bool', persist: false },
		{ name: 'Discountable', type: 'bool', persist: false },
		{ name: 'Provider', type: 'string', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Icon', type: 'string', persist: false },
		{ name: 'Description', type: 'string', persist: false },
		{ name: 'StripeConnectKey', type: 'singleitem', persist: false }
	],

	//TODO we want the pricing link on the actual purchasable
	getLink: function(rel){
		if(rel === 'pricing'){
			return getURL('/dataserver2/store/price_purchasable_with_stripe_coupon');
		}
		if(rel === 'purchase'){
			return getURL('/dataserver2/store/post_stripe_payment');
		}
		return this.mixins.hasLinks.getLink.call(this, rel);
	}
});