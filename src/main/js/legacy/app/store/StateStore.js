const Ext = require('extjs');

require('legacy/common/StateStore');
require('legacy/model/Course'); //Still used?
require('legacy/model/store/GiftPurchaseAttempt');
require('legacy/model/store/PricingResults');
require('legacy/model/store/Purchasable');
require('legacy/model/store/PurchasableCourse');
require('legacy/model/store/PurchaseAttempt');
require('legacy/model/store/StripeConnectKey');
require('legacy/model/store/StripeOperationError');
require('legacy/model/store/StripePricedPurchasable');
require('legacy/model/store/StripePurchaseError');
require('legacy/model/store/StripePurchaseItem');
require('legacy/model/store/StripePurchaseOrder');


module.exports = exports = Ext.define('NextThought.app.store.StateStore', {
	extend: 'NextThought.common.StateStore',
	PURCHASABLES: [],

	getPurchasables: function () {
		return this.PURCHASABLES;
	},

	setPurchasables: function (items) {
		this.PURCHASABLES = items;

		this.fireEvent('purchasables-set', items);
	}
});
