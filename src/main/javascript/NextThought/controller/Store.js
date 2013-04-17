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
		'store.purchase.Complete',
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
				'purchase-confirm': {
					'process-purchase': this.submitPurchase
				},
				'purchase-complete': {
					'close': this.forceCloseWindow
				},
				'purchase-window *': {
					'price-purchase': this.pricePurchase
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
	 * Validates the given coupon code for the provided purchasable item.
	 *
	 * @param cmp The owner cmp
	 * @param purchaseDesc an object containing the Purchasable, Quantity, and Coupon.  Ommitted quantity is assumed 1, Coupon is optional.
	 * @param success The success callback called if the provided coupone is valid
	 * @param failure The failure callback called if we are unable to validate the coupon for any reason
	 */
	pricePurchase: function(cmp, purchaseDesc, success, failure){

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

		if(!pKey){
			//In real environments we shouldn't ever have a purchasable
			//without strip information (at this point) and if we do we shouldn't
			//get this far.  But in any event crap breaks in unexpected ways so don't die
			console.error('No Stripe connection info for purchasable', purchasable);
			win.showError('Expected connection info');
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
			win.hideError();
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
	 * Make the purchase for purhcasable using tokenObject
	 *
	 * @param cmp the owner cmp
	 * @param purchasable the item to purchase
	 * @param tokenObject the stripe token object
	 */
	submitPurchase: function(cmp, purchasable, tokenObject){
		//TODO need to pass quantity and coupon code once the UI collects it
		//TODO also send along expected price so ds can verify against it?

		var connectInfo = purchasable.get('StripeConnectKey') || {},
			pKey = connectInfo.get('PublicKey'),
			tokenId = (tokenObject || {}).id,
			win = this.getPurchaseWindow();


		//At this point we shouldn't get here without a purchasable and tokenObject.  The
		//tokenObject should have a token id at this point.  We should also have a window.
		//All these various error conditions should be handled else where but if crap hits the fan fail somewhat
		//gracefully.  These should all be programming error cases
		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		if(!pKey){
			//In real environments we shouldn't ever have a purchasable
			//without strip information (at this point) and if we do we shouldn't
			//get this far.  But in any event crap breaks in unexpected ways so don't die
			console.error('No Stripe connection info for purchasable', purchasable);
			return;
		}

		if(!tokenId){
			//In real environments we shouldn't ever have a purchasable
			//without strip information (at this point) and if we do we shouldn't
			//get this far.  But in any event crap breaks in unexpected ways so don't die
			console.error('No token id to make purchase with', arguments);
			return;
		}

		//Ok the idea here is to make an ajax request to start the payment processing.
		//then we start polling for the processing to complete.  On success we move
		//the user to the thank you page.  On an error we move them back to the payment form
		if(win.lockPurchaseAction){
			return false;
		}
		win.lockPurchaseAction = true;

		win.getEl().mask('Your purchase is being finalized.  This may take several moments');
		try{
			this.initiatePayment(cmp, purchasable, tokenObject, function(){
				delete win.lockPurchaseAction;
				win.getEl().unmask();
			});
		}
		catch(e){
			//An exception here means we shouldn't have even started the purchase on the ds.
			//in this case the users card shouldn't have been carged yet.

			console.error('An error occurred initiating payment.  Please try again later.', Globals.getError(e), arguments);

			//Treat this like a failure and pop back to the payment form?
			delete win.lockPurchaseAction;
			win.getEl().unmask();
		}
	},

	/**
	 * Submit a payment request for the given purchasable and token
	 * When a PaymentAttempt finishes logic is handed off to handleCompletedPurchase.
	 * A completion callback can be provided that will be
	 */
	initiatePayment: function(cmp, purchasable, token, completion){
		this.handleCompletedPurchase(purchasable, token, null, completion);
	},


	/**
	 * Inspect the completed purchase attempt and handle success or failurs.
	 * On success move the user to the thank you page.  On failure move the user
	 * back to the form view (asking to populate from the card info on the token object)
	 * and displaying the necessary error from the server.  On completion call the callback
	 */
	handleCompletedPurchase: function(purchasable, token, completedAttempt, completion){
		var win = this.getPurchaseWindow(),
			cmp = win ? win.items.first() : undefined;

		win.remove(cmp, true);
		win.add({xtype: 'purchase-complete', record: purchasable, purchaseAttempt: completedAttempt});
		Ext.callback(completion);
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
