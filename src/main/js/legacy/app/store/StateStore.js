var Ext = require('extjs');
var CommonStateStore = require('../../common/StateStore');
var StoreGiftPurchaseAttempt = require('../../model/store/GiftPurchaseAttempt');
var StorePricingResults = require('../../model/store/PricingResults');
var StorePurchasable = require('../../model/store/Purchasable');
var StorePurchasableCourse = require('../../model/store/PurchasableCourse');
var StorePurchaseAttempt = require('../../model/store/PurchaseAttempt');
var StoreStripeConnectKey = require('../../model/store/StripeConnectKey');
var StoreStripOperationError = require('../../model/store/StripeOperationError');
var StoreStripePricedPurchasable = require('../../model/store/StripePricedPurchasable');
var StoreStripePurchaseError = require('../../model/store/StripePurchaseError');
var StoreStripePurchaseItem = require('../../model/store/StripePurchaseItem');
var StoreStripePurchaseOrder = require('../../model/store/StripePurchaseOrder');


module.exports = exports = Ext.define('NextThought.app.store.StateStore', {
    extend: 'NextThought.common.StateStore',
    PURCHASABLES: [],

    getPurchasables: function() {
		return this.PURCHASABLES;
	},

    setPurchasables: function(items) {
		this.PURCHASABLES = items;

		this.fireEvent('purchasables-set', items);
	}
});
