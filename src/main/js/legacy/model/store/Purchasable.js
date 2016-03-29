var Ext = require('extjs');
var ModelBase = require('../Base');
var StoreStripeConnectKey = require('./StripeConnectKey');
var {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.model.store.Purchasable', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.store.purchasable',

	fields: [
		{ name: 'Featured', type: 'bool', persist: false, defaultValue: false },
		{ name: 'Activated', type: 'bool', persist: false },
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'BulkPurchase', type: 'bool', persist: false },
		{ name: 'Discountable', type: 'bool', persist: false },
		{ name: 'Provider', type: 'string', persist: false },
		{ name: 'Giftable', type: 'bool', persist: false },
		{ name: 'Title', type: 'string', persist: false },
		{ name: 'Icon', type: 'string', persist: false },
		{ name: 'Description', type: 'string', persist: false },
		{ name: 'StripeConnectKey', type: 'singleitem', persist: false },
		{ name: 'Items', type: 'auto', persist: false },
		{ name: 'isCourse', type: 'bool', persist: false, defaultValue: false },
		{ name: 'courseName', type: 'string', persist: false, defaultValue: '' },
		{ name: 'HasHistory', type: 'bool', persist: false, affectedBy: 'Last Modified', convert: function (v, r) {
			return r && r.hasHistory();
		}}
	],

	isActive: function () {
		return Boolean(this.get('Activated'));
	},

	isPurchasable: true,

	//TODO we want the pricing link on the actual purchasable
	getLink: function (rel) {
		if (rel === 'pricing') {
			return getURL('/dataserver2/store/price_purchasable_with_stripe_coupon');
		}
		if (rel === 'purchase') {
			return getURL('/dataserver2/store/post_stripe_payment');
		}
		return this.mixins.hasLinks.getLink.call(this, rel);
	},

	hasHistory: function () {
		return Boolean(this.getLink('history'));
	},

	fireAcquisitionEvent: function (eventSource, callback) {
		try {
			return eventSource.fireEvent('show-purchasable', eventSource, this);
		} finally {
			Ext.callback(callback);
		}
	},

	isGiftable: function () {
		return !!this.getLink('gift_stripe_payment');
	},

	isRedeemable: function () {
		return !!this.getLink('redeem_gift');
	}
});
