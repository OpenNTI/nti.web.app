var Ext = require('extjs');
var Globals = require('../../util/Globals');
var {getURL} = Globals;
var ParseUtils = require('../../util/Parsing');
var StoreUtils = require('../../util/Store');
var CommonActions = require('../../common/Actions');
var LibraryStateStore = require('../library/StateStore');
var StoreStateStore = require('./StateStore');
var LoginStateStore = require('../../login/StateStore');


module.exports = exports = Ext.define('NextThought.app.store.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();
		this.Store = NextThought.app.store.StateStore.getInstance();

		if (window.Service && !this.Store.loading && !this.Store.hasFinishedLoad) {
			this.onLogin();
		} else {
			this.LoginStore.registerLoginAction(this.onLogin.bind(this), 'load-purchasables');
		}
	},

	onLogin: function () {
		if (this.LibraryStore.hasLoaded()) {
			this.loadPurchasables();
		} else {
			this.mon(this.LibraryStore, 'loaded', this.loadPurchasables.bind(this));
		}
	},

	loadPurchasables: function () {
		var service = window.Service,
			collection = service && service.getCollection('store', 'store'),
			link = collection && service.getLinkFrom(collection.Links, 'get_purchasables'),
			store = this.Store;


		if (!link) { return; }

		store.setLoading();

		StoreUtils.loadItems(getURL(link))
			.then(this.__updateLibraryWithPurchasables.bind(this))
			.then(store.setPurchasables.bind(store))
			.then(store.setLoaded.bind(store));
	},

	__updateLibraryWithPurchasables: function (items) {
		var library = this.LibraryStore;

		(items || []).forEach(function (p) {
			(p.get('Items') || []).forEach(function (itemId) {
				var title = library.getTitle(itemId);

				if (title) {
					title.set('sample', !p.get('Activated'));
				}
				else {
					console.warn('This purchasable item is not in the library:', itemId);
				}
			});
		});

		return items;
	},

	/**
	 * Called to generate a stripe payment token from purchase information
	 *
	 * @param {NextThought.view.store.purchase.Form} cmp the owner cmp
	 * @param {Object} desc
	 * @param {Object} cardinfo to provide to stripe in exchange for a token
	 */
	createEnrollmentPurchase: function (sender, desc, cardinfo, success, failure) {
		var purchasable = desc.Purchasable || {},
			connectInfo = purchasable.get('StripeConnectKey'),
			pKey = connectInfo && connectInfo.get('PublicKey'),
			tokenObject, me = this;

		if (!pKey) {
			console.error('No Stripe connection infor for the purchasable', purchasable);
			failure.call();
			return;
		}

		if (sender.lockPurchaseAction) {
			failure.call();
			return;
		}

		function onPriced (result) {
			delete sender.lockPurchaseAction;
			success.call(null, {pricing: result, tokenObject: tokenObject});
		}

		function onFail (reason) {
			delete sender.lockPurchaseAction;
			failure.call(null, reason);
		}

		function tokenResponseHandler (status, response) {
			if (status !== 200 || response.error) {
				console.error('An error occurred during the token generation for purchasable', purchasable, response);
				onFail(response.error);
			} else {
				console.log('Stripe token response handler', arguments);
				tokenObject = response;
				me.priceEnrollmentPurchase(me, desc, onPriced, onFail);
			}
		}

		sender.lockPurchaseAction = true;

		try {
			if (desc.from && !Globals.isEmail(desc.from)) {
				onFail({
					Type: 'FormError',
					Message: 'Invalid Email',
					field: 'from'
				});
			} else if (desc.receiver && !Globals.isEmail(desc.receiver)) {
				onFail({
					Type: 'FormError',
					Message: 'Invalid Email',
					field: 'receiver'
				});
			} else {
				Stripe.setPublishableKey(pKey);
				Stripe.setApiVersion('2012-11-07');
				Stripe.createToken(cardinfo, tokenResponseHandler);
			}
		} catch (e) {
			console.error('Error generating a stripe token', e);
			delete sender.lockPurchaseAction;
			failure.call();
		}
	},

	/**
	 * validates a coupon code or figures the cost for activation keys
	 * @param {Component} sender  the form that is sending the request
	 * @param {Object} desc an object containing the Purchasable, Quantity, and Coupon.	 Ommitted quantity is assumed 1, Coupon is optional.
	 * @param {Function} success The success callback called if the provided coupone is valid
	 * @param {Function} failure The failure callback called if we are unable to validate the coupon for any reason
	 */
	priceEnrollmentPurchase: function (sender, desc, success, failure) {
		desc = desc || {};
		success = success || function () {};
		failure = failure || function () {};

		var purchasable = desc.Purchasable,
			data = {},
			pricingLink = purchasable && purchasable.getLink('pricing');

		if (!pricingLink) {
			console.error('Must supply a purchasable with a pricing link', arguments);
			Ext.Error.raise('Must supply a purchasable');
		}

		if (sender !== this && sender.lockPurchaseAction) {
			console.error('Already locked aborting pricePurchase', arguments);
			return false;
		}

		if (sender !== this) {
			sender.lockPurchaseAction = true;
		}

		data.purchasableID = purchasable.getId();

		if (desc.Coupon) {
			data.Coupon = desc.Coupon.ID || desc.Coupon;
		}

		if (desc.Quantity > 0) {
			data.Quantity = desc.Quantity;
		}

		try {
			this.doEnrollmentPricingRequest(pricingLink, data)
				.then(function (result) {
					delete sender.lockPurchaseAction;

					if (result) {
						result = ParseUtils.parseItems(result)[0];
					}

					if (!result || !result.isPricedPurchase) {
						throw 'Unknown response from pricing call';
					} else {
						success.call(null, result);
					}
				})
				.catch(function (reason) {
					console.error('Error processing price,', reason);

					if (reason && reason.responseText) {
						reason = Ext.JSON.decode(reason.responseText, true);
					}

					failure.call(null, reason);
					delete sender.lockPurchaseAction;
				});
		} catch (e) {
			console.error('Error process price', e);
			failure.call();
			delete sender.lockPurchaseAction;
		}
	},

	doPricingRequest: function (url, data, callback) {
		Ext.Ajax.request({
			url: url,
			jsonData: data,
			method: 'POST',
			scope: this,
			callback: callback
		});
	},

	doEnrollmentPricingRequest: function (url, data) {
		return Service.post(url, data);
	},

	__attemptPurchase: function (purchaseDescription, tokenObject, expectedPrice, linkName) {
		var purchasable = purchaseDescription.Purchasable,
			tokenId = tokenObject.id,
			url = purchasable && purchasable.getLink(linkName),
			data;

		if (!purchasable || !tokenId) {
			console.error('Invalid arugments supplied to submit purchase', arguments);
			return Promise.reject();
		}

		if (!url) {
			console.error('No link with that name', linkName, purchasable);
			return Promise.reject();
		}

		data = {
			token: tokenId,
			purchasableID: purchasable.getId(),
			context: {
				AllowVendorUpdates: purchaseDescription.subscribe
			}
		};

		if (purchaseDescription.sender !== undefined) {
			data.sender = purchaseDescription.sender;
		}

		if (purchaseDescription.from !== undefined) {
			data.from = purchaseDescription.from;
		}

		if (purchaseDescription.receiver !== undefined) {
			data.receiver = purchaseDescription.receiver;
		}

		if (purchaseDescription.to !== undefined) {
			data.to = purchaseDescription.to;
		}

		if (purchaseDescription.immediate !== undefined) {
			data.immediate = purchaseDescription.immediate;
		}

		if (purchaseDescription.message !== undefined) {
			data.message = purchaseDescription.message;
		}

		if (purchaseDescription.Coupon !== undefined) {
			data.coupon = purchaseDescription.Coupon;
		}

		if (purchaseDescription.Quantity) {
			data.quantity = purchaseDescription.Quantity;
		}

		if (expectedPrice !== undefined) {
			data.expectedAmount = expectedPrice;
		}

		return Service.post(url, data)
				.then(this.__parsePurchaseAttempt.bind(this));
	},

	__parsePurchaseAttempt: function (response) {
		var result = Ext.JSON.decode(response, true);

		if (result) {
			result = ParseUtils.parseItems(result.Items || result)[0];
		}

		if (!result || !result.isPurchaseAttempt) {
			console.error('Unexpected response type');

			return Promise.reject();
		}

		return result;
	},

	__pollPurchaseAttempt: function (purchaseAttempt) {
		var me = this,
			startedPollingAt = (new Date()).getTime(),
			maxWaitInMillis = 2 * 60 * 1000, //2 minutes
			pollingIntervalInMillis = 5 * 1000; //5 seconds

		function poll (attempt) {
			var url = attempt.getLink('get_purchase_attempt');

			return Service.request(url)
					.then(me.__parsePurchaseAttempt.bind(me));
		}

		return new Promise(function (fulfill, reject) {
			function process (delay, attempt) {
				var now = (new Date()).getTime();

				if (attempt && attempt.isComplete()) {
					if (attempt.isSuccess()) {
						fulfill(attempt);
					} else if (attempt.isFailure()) {
						reject(attempt);
					} else {
						reject();
					}
				} else if (startedPollingAt + maxWaitInMillis < now) {
					reject(attempt);
				} else if (delay) {
					wait(delay)
						.then(poll.bind(me, attempt))
						.then(process.bind(me, pollingIntervalInMillis))
						.catch(reject);
				} else {
					poll(attempt)
						.then(process.bind(me, pollingIntervalInMillis))
						.catch(reject);
				}
			}

			process(0, purchaseAttempt);
		});
	},

	/**
	 * Make the purchase for purchasable using tokenObject
	 *
	 * @param {Component} cmp the owner cmp
	 * @param {Object} purchaseDescription an object containing the Purchasable, Quantity, and Coupon.	Omitted quantity is assumed 1, Coupon is optional.
	 * @param {Object} tokenObject the stripe token object
	 * @param {NextThought.model.store.StripePricedPurchasable} pricingInfo
	 * @param {Function} success success callback
	 * @param {Function} failure failure callback
	 */
	submitEnrollmentPurchase: function (sender, purchaseDescription, tokenObject, pricingInfo, success, failure) {
		var me = this;

		if (sender.lockPurchaseAction) {
			console.error('window already locked aborting submitEnrollmentPurchase', arguments);
			failure.call(null, {
				Message: 'Purchase already in progress'
			});
			return;
		}

		sender.lockPurchaseAction = true;

		function done () {
			delete sender.lockPurchaseAction;
		}

		me.__attemptPurchase(purchaseDescription, tokenObject, pricingInfo.get('PurchasePrice'), 'purchase')
			.then(me.__pollPurchaseAttempt.bind(me))
			.then(function (attempt) {
				done();

				success.call(null, {
					Message: 'Purchase attempt success',
					purchaseAttempt: attempt
				});
			})
			.catch(function (attempt) {
				done();

				if (attempt && attempt.isPurchaseAttempt) {
					failure.call(null, {
						Message: 'Purchase attempt failed',
						purchaseAttempt: attempt
					});
				} else {
					failure.call(null, {
						Message: '',
						tokenObject: tokenObject
					});
				}
			});
	},

	/**
	 * Make the purchase for purchasable using tokenObject
	 *
	 * @param {Component} cmp the owner cmp
	 * @param {Object} purchaseDescription an object containing the Purchasable, Quantity, and Coupon.	Omitted quantity is assumed 1, Coupon is optional.
	 * @param {Object} tokenObject the stripe token object
	 * @param {NextThought.model.store.StripePricedPurchasable} pricingInfo
	 * @param {Function} success success callback
	 * @param {Function} failure failure callback
	 */
	submitGiftPurchase: function (sender, purchaseDescription, tokenObject, pricingInfo, success, failure) {
		var me = this;

		if (sender.lockPurchaseAction) {
			console.error('window already locked aborting submitGirfPurchase', arguments);
			failure.call(null, {
				Message: 'Purchase already in progress'
			});
			return;
		}

		sender.lockPurchaseAction = true;

		function done () {
			delete sender.lockPurchaseAction;
		}

		me.__attemptPurchase(purchaseDescription, tokenObject, pricingInfo.get('PurchasePrice'), 'gift_stripe_payment')
			.then(me.__pollPurchaseAttempt.bind(me))
			.then(function (attempt) {
				done();

				success.call(null, {
					Message: 'Purchase attempt success',
					purchaseAttempt: attempt
				});
			})
			.catch(function (attempt) {
				done();

				if (attempt && attempt.isPurchaseAttempt) {
					failure.call(null, {
						Message: 'Purchase attempt failed',
						purchaseAttempt: attempt
					});
				} else {
					failure.call(null, {
						Message: '',
						tokenObject: tokenObject
					});
				}
			});
	},

	/**
	 * Submit a redeem token for a purchasable
	 * @param  {Ext.Component} sender	   the component sending the request
	 * @param  {NextThought.model.store.Purchasable} purchasable the purchasable the token is for
	 * @param  {String} token		the redeem token
	 * @param  {Boolean} allowVendorUpdates subscribe the user to updates from the vendor
	 * @param {String} ntiid ntiid of the thing you are redeeming
	 * @param  {Function} success	success callback
	 * @param  {Function} failure	failure callback
	 */
	redeemGift: function (sender, purchasable, token, allowVendorUpdates, ntiid, success, failure) {
		var me = this,
			url = purchasable && purchasable.getLink('redeem_gift');

		if (sender.lockPurchaseAction) {
			console.error('Window already locked aborting redeem gift', arguments);
			failure.call();
			return;
		}

		if (!url) {
			console.error('No redeem gift link');
			failure.call();
			return;
		}

		sender.lockPurchaseAction = true;

		function done () {
			delete sender.lockPurchaseAction;
		}

		Service.post(url, {
			code: token,
			AllowVendorUpdates: allowVendorUpdates,
			NTIID: ntiid
		})
			.then(function (response) {
				var courseInstance = ParseUtils.parseItems(response)[0];

				done();
				success.call(null, courseInstance);
			})
			.catch(function (response) {
				done();

				var json = Ext.decode(response && response.responseText, true);

				if (!json) {
					json = {
						Message: 'An unknown error occurred. Please try again later.'
					};
				}

				failure.call(null, json);
			});
	}
});
