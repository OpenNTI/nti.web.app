export default Ext.define('NextThought.app.store.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: [
		'NextThought.model.store.GiftPurchaseAttempt',
		'NextThought.model.store.PricingResults',
		'NextThought.model.store.Purchasable',
		'NextThought.model.store.PurchasableCourse',
		'NextThought.model.store.PurchaseAttempt',
		'NextThought.model.store.StripeConnectKey',
		'NextThought.model.store.StripOperationError',
		'NextThought.model.store.StripePricedPurchasable',
		'NextThought.model.store.StripePurchaseError',
		'NextThought.model.store.StripePurchaseItem',
		'NextThought.model.store.StripePurchaseOrder'
	],

	PURCHASABLES: [],


	getPurchasables: function() {
		return this.PURCHASABLES;
	},


	setPurchasables: function(items) {
		this.PURCHASABLES = items;

		this.fireEvent('purchasables-set', items);
	}
});
