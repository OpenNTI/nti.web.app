Ext.define('NextThought.controller.Store', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.Library'
	],

	models: [
		'store.Purchasable',
		'store.PurchaseAttempt'
	],

	stores: [
		'Purchasable'
	],

	views: [
		'NextThought.view.store.PurchaseWindow'
	],

	refs: [
		{ ref: 'navigationMenu', selector: 'navigation-menu'},
		{ ref: 'purchaseWindow', selector: 'purchase-window'}
	],

	init: function(){
		this.callParent(arguments);
		this.application.on('session-ready', this.onSessionReady, this);

		this.listen({
			component:{
				'purchase-window button[action=cancel]': {
					'click': this.purchaseWindowCancel
				},
				'purchase-window' : {
					'beforeclose': this.maybeClosePurchaseWindow
				}
			}
		});
	},

	onSessionReady: function(){
		var store = this.getPurchasableStore();
		store.on('load', this.maybeAddPurchasables,this);
		store.proxy.url = $AppConfig.service.getPurchasableItemURL();
		Library.on('loaded',function(){store.load();},this,{single:true});
	},


	maybeAddPurchasables: function(){

		//the 0, is for dev only, will remove later.
		this.getNavigationMenu().add(0,{
			xtype: 'navigation-collection',
			store: this.getPurchasableStore(),
			name: 'Available for Purchase'
		});
	},


	/**
	 * Show the detail/purchase view for the given purchasable
	 *
	 * @param purchasable The Purchasable object to show
	 */
	showPurchasable: function(purchasable){
		var win;

		//If we are currently showing a purchase window
		//don't show another one, we shouldn't be able to get into this state
		if(this.getPurchaseWindow()){
			console.error('Purhcase already in progress.  How did you manage this', win);
			return null;
		}

		win = NextThought.view.store.PurchaseWindow.create({purchasable: purchasable});
		win.show();
		return win;
	},


	/**
	 *
	 * Validates the given coupone code for the provided purchasable item.
	 *
	 * @param cmp The owner cmp
	 * @param purchaseDesc an object containing the Purchasable,
	 * @param coupon The coupon code to validate
	 * @param success The success callback called if the provided coupone is valid
	 * @param failure The failure callback called if we are unable to validate the coupon for any reason
	 */
	validateCouponCode: function(cmp, purchaseDesc, coupon, success, failure){

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
	 * @param purchaseDesc an object containing the Purchasable, Quantity and PaymentInfo
	 * @param token a stripe payment token from createPurchase
	 * @param success the callback called when the purchase has completed succesfully
	 * @param failure the callback for error conditions
	 */
	submitPurchase: function(cmp, purchaseDesc, token, success, failure){

	},

	/**
	 * Handler for canceling an in progress purchase.
	 *
	 * @param btn the button triggering the cancel
	 */

	purchaseWindowCancel: function(btn){
		btn.up('window').close();
	},

	maybeClosePurchaseWindow: function(win){
		//Detect this by looking at what stage in the process we are in.
		//I.E its safe to close from the detail view, but not once we have started
		//a purchase process
		var destructive = true;

		if(!win.forceClosing && destructive){

			/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
			Ext.Msg.show({
				msg: 'This will cancel your current purchase.',
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				icon: 'warning-red',
				buttonText: {'ok': 'caution:Cancel my purchase'},
				title: 'Are you sure?',
				fn: function(str){
					if(str === 'ok'){
						win.forceClosing = true;
						win.close();
						delete win.forceClosing;
					}
				}
			});

			return false;
		}
		return true;
	}
});
