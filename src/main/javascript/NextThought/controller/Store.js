Ext.define('NextThought.controller.Store', {
	extend: 'Ext.app.Controller',

	models: [
		'store.Purchasable',
		'store.PurchaseAttempt'
	],

	stores: [
		'Purchasable'
	],

	views: [
	],

	refs: [
		{ ref: 'navigationMenu', selector: 'navigation-menu'}
	],

	init: function(){
		this.callParent(arguments);
		this.application.on('session-ready', this.onSessionReady, this);
	},

	onSessionReady: function(){
		var app = this.application,
			store = this.getPurchasableStore(),
			token = {};

		app.registerInitializeTask(token);
		store.on('load', function(){ app.finishInitializeTask(token); }, this, {single: true});
		store.proxy.url = $AppConfig.service.getPurchasableItemURL();
		store.load();
	},

	/**
	 * Show the detail/purchase view for the given purchasable
	 *
	 * @param purchasable The NTIID or Purchasable object to show
	 */
	showPurchasable: function(purchasable){

	},


	/**
	 *
	 * Validates the given coupone code for the provided purchasable item.
	 *
	 * @param cmp The owner cmp
	 * @param purchasable The Purchasable object to validate the coupon code with
	 * @param coupon The coupon code to validate
	 * @param success The success callback called if the provided coupone is valid
	 * @param failure The failure callback called if we are unable to validate the coupon for any reason
	 */
	validateCouponCode: function(cmp, purchasable, coupon, success, failure){

	},

	/**
	 * Called to generate a stripe payment token from purchase information
	 *
	 * @param cmp the owner cmp
	 * @param purchaseDesc an object containing the Purchasable, Quantity and card information
	 * @param success The success callback called with the generated stripe token
	 * @param failure The failure callback called if the token generation fails
	 */
	createPurchase: function(cmp, purchaseDesc, success, failure){

	},

	/**
	 *
	 * @param cmp the owner cmp
	 * @param purchaseDesc an object containing the Purchasable, Quantity and card information
	 * @param token a stripe payment token from createPurchase
	 * @param success the callback called when the purchase has completed succesfully
	 * @param failure the callback for error conditions
	 */
	submitPurchase: function(cmp, purchaseDesc, token, success, failure){

	},

	/**
	 * Handler for canceling an in progress purchase.
	 *
	 * @param cmp the owner cmp
	 */
	cancelPurchase: function(cmp){

	}
});
