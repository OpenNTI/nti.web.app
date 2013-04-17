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
		'store.purchase.Window',
		'store.purchase.Form',
		'store.purchase.Confirm',
		'store.menus.Collection'
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
				},
				'purchasable-collection': {
					'select': this.purhcasableCollectionSelection
				},
				'purchase-detailview':{
					'show-purchase-form': this.showPurchaseForm
				},
				'purchase-form': {
					'create-payment-token': this.createPurchase
				},
				'purchase-complete': {
					'close': this.forceCloseWindow
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
			xtype: 'purchasable-collection',
			store: this.getPurchasableStore(),
			name: 'Available for Purchase'
		});
	},


	purhcasableCollectionSelection: function(cmp, record){
		this.showPurchasable(record);
	},


	/**
	 * Show the detail/purchase view for the given purchasable
	 *
	 * @param purchasable The Purchasable object to show
	 */
	showPurchasable: function(purchasable){
		var win = this.getPurchaseWindow();

		//If we are currently showing a purchase window
		//don't show another one, we shouldn't be able to get into this state
		if(win){
			console.error('Purhcase already in progress.  How did you manage this', win);
			return null;
		}

		return this.getView('store.purchase.Window').create({record: purchasable});
	},


	showPurchaseForm: function(view, purchasable){
		var win = this.getPurchaseWindow();
		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		console.log('Show purchase form', arguments);
		win.remove(view, true);
		win.add({xtype: 'purchase-form', record: purchasable});
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
	 * @param purchasable the purchasable object
	 * @param cardinfo to provide to stripe in exchange for a token
	 */
	createPurchase: function(cmp, purchasable, cardinfo){
		var connectInfo = purchasable.get('StripeConnectKey') || {},
			pKey = connectInfo && connectInfo.get('PublicKey'),
			win = this.getPurchaseWindow();

		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		if(!connectInfo){
			console.error('Expected a connectInfo', arguments);
			return;
		}

		if(!pKey){
			//In real environments we shouldn't ever have a purchasable
			//without strip information (at this point) and if we do we shouldn't
			//get this far.  But in any event crap breaks in unexpected ways so don't die
			console.error('No Stripe connection info for purchasable', purchasable);
			return;
		}

		function tokenResponseHandler(status, response){
			//https://stripe.com/docs/api#errors
			if(status !== 200 || response.error){
				console.error('An error occured during token generation for purchasable', purchasable, response);
				cmp.handleError(response);
			}
			else{
				console.log('Stripe token response handler', arguments);
				win.remove(cmp, true);
				win.add({xtype: 'purchase-confirm', record: purchasable, tokenObject: response});
			}
			win.getEl().unmask();
			delete win.lockPurchaseAction;
		}

		if(win.lockPurchaseAction){
			return false;
		}
		win.lockPurchaseAction = true;

		try{
			//Mask the window or the form?
			win.getEl().mask('Processing');

			//Make sure we are using the correct public key
			Stripe.setPublishableKey(pKey);
			Stripe.createToken(cardinfo, tokenResponseHandler);

		}
		catch(e){
			console.error('An exception occurred creating stripe token', Globals.getError(e));
			//TODO Pass this to the view for display?  It would most likely be a programming error
			cmp.handleError('An unknown error occurred.  Please try again later.');
			delete win.lockPurchaseAction;
			win.getEl().unmask();
		}
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
		var destructive = !win.down('[closeWithoutWarn=true]'),
			me = this;

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
						me.forceCloseWindow(null, win);
					}
				}
			});

			return false;
		}
		return true;
	},

	forceCloseWindow: function(cmp, w){
		var win = w || this.getPurchaseWindow();

		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		win.forceClosing = true;
		win.close();
		delete win.forceClosing;
	}
});
