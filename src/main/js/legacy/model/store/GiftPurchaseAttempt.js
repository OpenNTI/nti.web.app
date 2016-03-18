var Ext = require('extjs');
var StorePurchaseAttempt = require('./PurchaseAttempt');
var {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.model.store.GiftPurchaseAttempt', {
	extend: 'NextThought.model.store.PurchaseAttempt',

	statics: {
		STATE_UNKNOWN: 'Unknown',
		STATE_FAILURE: 'Failed',
		STATE_SUCCESS: 'Success',
		STATE_STARTED: 'Started'
	},

	fields: [
		{name: 'Receiver', type: 'string'},
		{name: 'ReceiverName', type: 'string'},
		{name: 'Message', type: 'string'}
	],

	getLink: function(rel) {
		if (rel === 'get_purchase_attempt') {
			return getURL('/dataserver2/store/get_gift_purchase_attempt?' + Ext.Object.toQueryString({purchaseID: this.getId(), creator: this.get('Creator')}));
		}

		return this.callParent(arguments);
	}
});
