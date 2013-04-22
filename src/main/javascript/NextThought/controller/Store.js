Ext.define('NextThought.controller.Store', {
	extend: 'Ext.app.Controller',

	requires: [
		'NextThought.Library'
	],

	models: [
		'store.Purchasable',
		'store.PurchaseAttempt',
		'store.StripePricedPurchasable',
		'store.StripePurchaseError'
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
					'show-purchase-form': this.showPurchaseForm,
					'purchase-with-activation': this.activateWithCode
				},
				'purchase-form': {
					'create-payment-token': this.createPurchase
				},
				'purchase-confirm': {
					'process-purchase': this.submitPurchase,
					'edit-purchase': this.editPurchase
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


	//TODO a way to have this collection show up only if there are purchasable
	//items that have not yet been purchased?
	maybeAddPurchasables: function(){
		//the 0, is for dev only, will remove later.
		this.getNavigationMenu().add(0,{
			xtype: 'purchasable-collection',
			store: this.getPurchasableStore(),
			name: 'Available for Purchase'
		});
	},


	purhcasableCollectionSelection: function(cmp, record){
		Ext.menu.Manager.hideAll();
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


	transitionToComponent: function(win, cfg){
		win.hideError();
		win.removeAll(true);
		return win.add(cfg);
	},


	safelyMaskWindow: function(win, msg){
		var el = win ? win.getEl() : undefined;
		if(el){
			el.mask(msg);
			return true;
		}
		return false;
	},


	safelyUnmaskWindow: function(win){
		var el = win ? win.getEl() : undefined;
		if(el){
			el.unmask();
			return true;
		}
		return false;
	},


	showPurchaseForm: function(view, purchasable){
		var win = this.getPurchaseWindow();
		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		console.log('Show purchase form', arguments);
		this.transitionToComponent(win, {xtype: 'purchase-form', record: purchasable});
	},


	editPurchase: function(sender, desc, token){
		var win = this.getPurchaseWindow();
		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		console.log('Editing purchase', arguments);
		this.transitionToComponent(win, {xtype: 'purchase-form', purchaseDescription: desc, tokenObject: token});
	},


	doPricingRequest: function(url, data, callback){
		Ext.Ajax.request({
			url: url,
			jsonData: data,
			method: 'POST',
			scope: this,
			callback: callback
		});
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
	pricePurchase: function(sender, desc, success, failure, scope){
		var purchaseDesc = desc || {},
			purchasable = purchaseDesc.Purchasable,
			data = {},
			win = this.getPurchaseWindow();

		if(!purchasable || !purchasable.getLink('pricing')){
			console.error('Must supply a purchasable with a pricing link', arguments);
			Ext.Error.raise('Must supply a purchasable');
		}

		//We don't strictly require a window other than for safety locking,
		//but this really shouldnt ever be called out of the context of a purchase
		//in some for or another.  If it is called outside of a window treat it as a programming error and raise
		//an exception.
		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		//We do our safety locking of the window here but we don't do any masking
		//The caller may or may not want to mask various
		if(sender !== this && win.lockPurchaseAction){
			console.error('Window already locked aborting pricePurchase', arguments);
			return false;
		}

		if(sender !== this){
			win.lockPurchaseAction = true;
		}

		data.purchasableID = purchasable.getId();
		if(purchaseDesc.Coupon){
			data.Coupon = purchaseDesc.Coupon.ID || purchaseDesc.Coupon;
		}
		if(purchaseDesc.Quantity > 0){
			data.Quantity = purchaseDesc.Quantity;
		}

		try{
			this.doPricingRequest(purchasable.getLink('pricing'), data, function(r, s, response){
				if(sender !== this){
					delete win.lockPurchaseAction;
				}
				try{
					var result;
					if(!s){
						console.error('Pricing call failed', arguments);
						Ext.callback(failure, scope, [r, response]);
					}
					else{
						result = Ext.JSON.decode(response.responseText, true);
						if(result){
							result = ParseUtils.parseItems(result)[0];
						}

						if(!result || !result.isPricedPurchase){
							console.error('Unknown response from pricing call', arguments);
							Ext.callback(failure, scope, [r, response]);
						}
						else{
							Ext.callback(success, scope, [result]);
						}
					}
				}
				catch(e){
					console.log('An error occured processing pricing callback', arguments);
					Ext.callback(failure, scope, [r, response]);
				}
			});
		}
		catch(e){
			Ext.callback(failure, scope, {error: e});
			if(sender !== this){
				delete win.lockPurchaseAction;
			}
		}
	},

	/**
	 * Called to generate a stripe payment token from purchase information
	 *
	 * @param cmp the owner cmp
	 * @param purchasable the purchasable object
	 * @param cardinfo to provide to stripe in exchange for a token
	 */
	createPurchase: function(cmp, desc, cardinfo){
		var purchasable = desc.Purchasable || {},
			connectInfo = purchasable.get('StripeConnectKey') || {},
			pKey = connectInfo && connectInfo.get('PublicKey'),
			win = this.getPurchaseWindow(), me = this;

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
			function done(){
				me.safelyUnmaskWindow(win);
				delete win.lockPurchaseAction;
			}

			if(status !== 200 || response.error){
				console.error('An error occured during token generation for purchasable', purchasable, response);
				cmp.handleError(response);
			}
			else{
				console.log('Stripe token response handler', arguments);
				me.pricePurchase(me, desc, function(priced){
					console.log('Final pricing complete', priced, desc);
					win.publishQuantityAndPrice(priced.get('Quantity'), priced.get('PurchasePrice'), priced.get('Currency'));
					me.transitionToComponent(win, {xtype: 'purchase-confirm', purchaseDescription: desc, tokenObject: response, pricingInfo: priced});
					done();
				},
				function(){
					console.error('An error occurred doing final pricing of', desc);
					if(win && win.showError){
						win.showError('Unable to price your purchase.  Please try again later')
					}
					done();
				});
			}
		}

		if(win.lockPurchaseAction){
			console.error('Window already locked aborting createPurchase', arguments);
			return false;
		}
		win.lockPurchaseAction = true;

		try{
			win.hideError();
			//Mask the window or the form?
			this.safelyMaskWindow(win, 'Processing');

			//Make sure we are using the correct public key
			Stripe.setPublishableKey(pKey);
			Stripe.createToken(cardinfo, tokenResponseHandler);

		}
		catch(e){
			console.error('An exception occurred creating stripe token', Globals.getError(e));
			win.showError('An unknown error occurred.  Please try again later.');
			delete win.lockPurchaseAction;
			this.safelyUnmaskWindow(win);
		}
	},

	/**
	 * Make the purchase for purhcasable using tokenObject
	 *
	 * @param cmp the owner cmp
	 * @param purchaseDesc an object containing the Purchasable, Quantity, and Coupon.  Ommitted quantity is assumed 1, Coupon is optional.
	 * @param tokenObject the stripe token object
	 */
	submitPurchase: function(cmp, purchaseDescription, tokenObject){

		var purchasable = purchaseDescription.Purchasable,
			tokenId = (tokenObject || {}).id,
			win = this.getPurchaseWindow(), delegate,
			me = this;


		//At this point we shouldn't get here without a purchasable and tokenObject.  The
		//tokenObject should have a token id at this point.  We should also have a window.
		//All these various error conditions should be handled else where but if crap hits the fan fail somewhat
		//gracefully.  These should all be programming error cases
		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}


		//Ok the idea here is to make an ajax request to start the payment processing.
		//then we start polling for the processing to complete.  On success we move
		//the user to the thank you page.  On an error we move them back to the payment form
		if(win.lockPurchaseAction){
			console.error('Window already locked aborting submitPurchase', arguments);
			return false;
		}
		win.lockPurchaseAction = true;
		this.safelyMaskWindow(win, 'Your purchase is being finalized.  This may take several moments');

		function done(){
			delete me.paymentProcessor;
			delete win.lockPurchaseAction;
			me.safelyUnmaskWindow(win);
		}

		delegate = {
			purchaseAttemptCompleted: function(helper, purchaseAttempt){
				this.transitionToComponent(win, {xtype: 'purchase-complete', purchaseDescription: purchaseDescription, purchaseAttempt: purchaseAttempt});
				done();
			},
			purchaseAttemptFailed: function(helper, purchaseAttempt){
				this.showFormWithError(win, cmp, purchasable, purchaseAttempt.get('Error'), tokenObject);
				done();
			},
			purchaseAttemptTimedOut: function(helper, purchaseAttempt){
				this.showFormWithError(win, cmp, purchasable, 'Purchase timed out.', tokenObject);
				done();
			},
			purchaseAttemptRequestFailed: function(helper, responseOrMsg, exception){
				this.showFormWithError(win, cmp, purchasable, responseOrMsg, tokenObject);
				done();
			},
			purchaseAttemptCompletedWithUnknownStatus: function(helper, purchaseAttempt){
				this.showFormWithError(win, cmp, purchasable, 'Unable to complete purchase at this time.', tokenObject);
				done();
			}
		};

		try{
			this.paymentProcessor = new NextThought.controller.store.PurchaseHelper(purchaseDescription, tokenObject, delegate, this);
		}
		catch(e){
			//An exception here means we shouldn't have even started the purchase on the ds.
			//in this case the users card shouldn't have been carged yet.
			console.error('An error occurred initiating payment.  Please try again later.', Globals.getError(e), arguments);
			//Treat this like a failure and pop back to the payment form?
			this.showFormWithError(win, cmp, purchasable, 'An error occurred initiating payment.  Please try again later.', tokenObject);
			done();
		}
	},


	showFormWithError: function(win, cmp, purchasable, error, tokenObject){
		var form;
		form = this.transitionToComponent(win, {xtype: 'purchase-form', record: purchasable, tokenObject: tokenObject});
		if(error){
			try{
				if(Ext.isString(error)){
					error = NextThought.model.store.StripePurchaseError({Message: error});
				}
				form.handleError(error);
			}
			catch(e){
				console.error('An error occurred setting an error. Ruh Roh', Globals.getError(e));
			}
		}
	},


	doActivateWithCode: function(url, data, callback){
		if(data.invitation_code === 'DIE'){
			Ext.callback(callback, this, [{}, false, {}]);
		}
		else{
			Ext.callback(callback, this, [{}, true, {}]);
		}

		/*Ext.Ajax.request({
			url: url,
			scope: this,
			jsonData: data,
			method: 'POST',
			headers: {
				Accept: 'application/json'
			},
			callback: callback
		});*/
	},


	activateWithCode: function(cmp, purchasable, code){
		var url = getURL('foo'),
			win= this.getPurchaseWindow(),
			me = this;

		if(!win){
			console.error('Expected a purchase window', arguments);
			return;
		}

		if(win.lockPurchaseAction){
			console.error('Window already locked aborting activation code', arguments);
			return false;
		}
		win.lockPurchaseAction = true;
		this.safelyMaskWindow(win, 'Redeeming activation code.');


		if (!url){
			win.showError('Unable to redeem your activation key');
			return;
		}


		try{
			this.doActivateWithCode(url,  {purchasableID: purchasable.getId(), invitation_code: code}, function(r, s, response){
				try{
					this.safelyUnmaskWindow(win);
					delete win.lockPurchaseAction;
					if(!s){
						win.showError('The activation key you entered is invalid.', 'Activation Key');
					}
					else {
						this.transitionToComponent(win, {xtype: 'purchase-complete', purchaseDescription: {Purchasable: purchasable}});
					}
				}
				catch(error){
					console.error('An unexpected exception occurred in activation code callback', Globals.getError(error), arguments);
					win.showError('A problem occurred redeeming your activation key');
					this.safelyUnmaskWindow(win);
					delete win.lockPurchaseAction;
				}
			});
		}
		catch(e){
			console.error('An unexpected exception occurred in activation code callback', Globals.getError(e), arguments);
			win.showError('A problem occurred redeeming your activation key');
			this.safelyUnmaskWindow(win);
			delete win.lockPurchaseAction;
		}
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

		//If we are in the step where payment has been submitted and we
		//are waiting on the payment attempt to complete don't let them close the window.
		//At this point they are getting charged, there is no going back.
		if(this.paymentProcessor){
			//TODO consider an alert here?
			console.warn('Presenting payment window from being closed while purchase is in progress', this.paymentProcessor);
			return false;
		}

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


/**
 * A "private" utility class to start a purchase and poll for it's completion.
 * It should be created with a purchaseRequest, a token object, and a delegate object
 * that handles errors and completion.  The delegate should implement the following function
 * that will be called with the provided scope
 *
 * purchaseAttemptCompleted(this, purchaseAttempt)
 * purchaseAttemptFailed(this, purchaseAttempt)
 * purchaseAttemptTimedOut(this, purchaseAttempt)
 * purchaseAttemptRequestFailed(this, responseOrMsg, exception)
 * purchaseAttemptCompletedWithUnknownStatus(this, purchaseAttempt)
 *
 */
Ext.define('NextThought.controller.store.PurchaseHelper', {

	maxWaitInMillis: 2 * 60 * 1000, //2 minutes
	pollingIntervalInMillis: 5 * 1000, //5 seconds

	constructor: function(purchaseDesc, tokenObject, delegate, scope){
		var purchasable = purchaseDesc.Purchasable,
			tokenId = tokenObject.id;

		if(!purchasable || !tokenId || !delegate){
			Ext.Error.raise('Must supply purchasable, token, and delegate', arguments);
		}

		this.purchasable = purchasable;
		this.coupon = purchaseDesc.Coupon;
		this.quantity = purchaseDesc.Quantity;
		this.expectedPrice = purchaseDesc.ExpectedPrice; //Note this is just so the ds can sanity check
		this.tokenId = tokenId;
		this.delegate = delegate;
		this.scope = scope;

		this.initiatePurchase();
	},


	parsePurchaseAttemptResponse: function(response){
		var result = Ext.JSON.decode(response.responseText, true);
		if(result){
			result = ParseUtils.parseItems(result.Items || result)[0];
		}
		if(!result || !result.isPurchaseAttempt){
			Ext.Error.raise('Unexpected response type');
		}
		return result;
	},

	initiatePurchase: function(){
		var url = this.purchasable.getLink('purchase'),
			data;

		if(!url){
			Ext.Error.raise('No purchase url for purchasable');
		}

		data = {
			token: this.tokenId,
			purchasableID: this.purchasable.getId()
		};
		if(this.coupon !== undefined){
			data.coupon = this.coupon;
		}
		if(this.quantity > 0){
			data.quantity = this.quantity;
		}
		if(this.expectedPrice !== undefined){
			data.expectedPrice = this.expectedPrice;
		}

		//TODO this needs to go away but the ds dies without it. Note this isn't even the right price
		data.Amount = this.purchasable.get('Amount');

		Ext.Ajax.request({
			url: url,
			jsonData: data,
			method: 'POST',
			scope: this,
			callback: function(req, s, resp){
				try{
					var result;
					if(!s){
						console.error('Purchase attempt was unsuccessful', arguments);
						this.delegate.purchaseAttemptRequestFailed.call(this.scope, this, resp);
					}
					else{
						try{
							result = this.parsePurchaseAttemptResponse(resp);
							this.startedPollingAt = new Date().getTime();
							this.processPurchaseAttempt(result, true);
						}
						catch(parseError){
							console.error('An error occurred parsing successful? response to begin purchase', arguments, Globals.getError(parseError));
							this.delegate.purchaseAttemptRequestFailed.call(this.scope, this, 'Unparsable return value', parseError);
						}
					}
				}
				catch(e){
					console.error('An error occured initiating purchase attempt', arguments, Globals.getError(e));
					this.delegate.purchaseAttemptRequestFailed.call(this.scope, this, 'An unknown error occurred initiating payment.', e);
				}
			}
		});
	},


	pollPurchaseAttempt: function(purchaseAttempt){
		var url = purchaseAttempt.getLink('get_purchase_attempt');
		console.log('Polling for purchase attempt', purchaseAttempt);
		Ext.Ajax.request({
			url: url,
			method: 'GET',
			scope: this,
			callback: function(req, s, resp){
				try{
					var result;
					if(!s){
						console.error('Purchase attempt poll was unsuccesful.  Will keep trying', arguments);
						this.processPurchaseAttempt(purchaseAttempt);
					}
					else{
						try{
							result = this.parsePurchaseAttemptResponse(resp);
							console.log('PurchaseAttempt polling complete.  Procceesing', result);
							this.processPurchaseAttempt(result);
						}
						catch(parseError){
							console.error('An error occurred parsing successful? polling response.  Will keep trying', arguments, Globals.getError(parseError));
							this.processPurchaseAttempt(purchaseAttempt);
						}
					}
				}
				catch(e){
					console.error('An error occurred polling for payment attempt', arguments, Globals.getError(e));
					this.processPurchaseAttempt(purchaseAttempt);
				}
			}
		});
	},


	processPurchaseAttempt: function(purchaseAttempt, immediate){
		if(purchaseAttempt && purchaseAttempt.isComplete()){
			this.handleCompletedPaymentAttempt(purchaseAttempt);
			return;
		}

		var now = new Date().getTime();

		if(this.startedPollingAt + this.maxWaitInMillis < now){
			//Hmm, not good.  We didn't complete in the time we wanted to wait.
			//It's not our job to handle this, but what in the world will our caller do
			console.error('Max polling time exceeded for purchase attempt', this, purchaseAttempt);
			this.delegate.purchaseAttemptTimedOut.call(this.scope, this, purchaseAttempt);
			return;
		}

		if(immediate){
			this.pollPurchaseAttempt(purchaseAttempt);
		}
		else{
			Ext.defer(this.pollPurchaseAttempt, this.pollingIntervalInMillis ,this, [purchaseAttempt]);
		}
	},

	handleCompletedPaymentAttempt: function(purchaseAttempt){
		if(purchaseAttempt.isSuccess()){
			console.log('Purchase attempt returned success', purchaseAttempt);
			this.delegate.purchaseAttemptCompleted.call(this.scope, this, purchaseAttempt);
		}
		else if(purchaseAttempt.isFailure()){
			console.warn('Purchase attempt returned failure', purchaseAttempt);
			this.delegate.purchaseAttemptFailed.call(this.scope, this, purchaseAttempt);
		}
		else{
			console.error('Purchase attempt finished with unknown status', purchaseAttempt);
			this.delegate.purchaseAttemptCompletedWithUnknownStatus.call(this.scope, this, purchaseAttempt);
		}
	}
});