Ext.define('NextThought.model.store.GiftPurchaseAttempt', {
	extend: 'NextThought.model.store.PurchaseAttempt',

	statics: {
		STATE_UNKNOWN: 'Unknown',
		STATE_FAILURE: 'Failed',
		STATE_SUCCESS: 'Success',
		STATE_STARTED: 'Started'
	},

	getLink: function(rel) {
		if (rel === 'get_purchase_attempt') {
			return getURL('/dataserver2/store/get_gift_purchase_attempt?' + Ext.Object.toQueryString({purchaseID: this.getId(), creator: this.get('Creator')}));
		}

		return this.callParent(arguments);
	}
});
