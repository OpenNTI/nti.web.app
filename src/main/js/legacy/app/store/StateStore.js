const Ext = require('@nti/extjs');

require('internal/legacy/common/StateStore');
require('internal/legacy/model/Course'); //Still used?
require('internal/legacy/model/store/GiftPurchaseAttempt');
require('internal/legacy/model/store/PricingResults');
require('internal/legacy/model/store/Purchasable');
require('internal/legacy/model/store/PurchasableCourse');
require('internal/legacy/model/store/PurchaseAttempt');
require('internal/legacy/model/store/StripeConnectKey');
require('internal/legacy/model/store/StripeOperationError');
require('internal/legacy/model/store/StripePricedPurchasable');
require('internal/legacy/model/store/StripePurchaseError');
require('internal/legacy/model/store/StripePurchaseItem');
require('internal/legacy/model/store/StripePurchaseOrder');

module.exports = exports = Ext.define('NextThought.app.store.StateStore', {
	extend: 'NextThought.common.StateStore',
	PURCHASABLES: [],

	getPurchasables: function () {
		return this.PURCHASABLES;
	},

	setPurchasables: function (items) {
		this.PURCHASABLES = items;

		this.fireEvent('purchasables-set', items);
	},
});
