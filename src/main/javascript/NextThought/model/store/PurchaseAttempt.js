Ext.define('NextThought.model.store.PurchaseAttempt', {
  extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.store.StripePurchaseOrder',
		'NextThought.model.store.PricingResults'
	],

	statics: {
		STATE_UNKNOWN: 'Unknown',
		STATE_FAILURE: 'Failed',
		STATE_SUCCESS: 'Success',
		STATE_STARTED: 'Started'
	},

  fields: [
    { name: 'Items', type: 'auto', persist: false },
    { name: 'State', type: 'string', persist: false },
    { name: 'Processor', type: 'string', persist: false },
    { name: 'StartTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date() },
    { name: 'Error', type: 'singleitem', persist: false},
    { name: 'Description', type: 'string', persist: false },
    { name: 'Quantity', type: 'int', persist: false },
    { name: 'TokenID', type: 'string', persist: false },
		{ name: 'InvitationCode', type: 'string', persist: false },
		{ name: 'RemainingInvitations', type: 'int', persist: false },
		{ name: 'Order', type: 'singleitem', persist: false},
		{ name: 'Pricing', type: 'singleitem', persist: false},
		{ name: 'RedemptionCode', type: 'string', persist: false },
		{ name: 'RedemptionTime', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date() }
  ],

	isPurchaseAttempt: true,

	//TODO we want the polling link on the attempt
	getLink: function(rel) {
		if (rel === 'get_purchase_attempt') {
			return getURL('/dataserver2/store/get_purchase_attempt?' + Ext.Object.toQueryString({purchaseID: this.getId()}));
		}
		return this.mixins.hasLinks.getLink.call(this, rel);
	},

	isComplete: function() {
		return this.isSuccess() || this.isFailure();
	},

	isSuccess: function() {
		return this.get('State') === this.self.STATE_SUCCESS;
	},

	isFailure: function() {
		return this.get('State') === this.self.STATE_FAILURE;
	}

});
