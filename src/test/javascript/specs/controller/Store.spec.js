describe('Store controller', function(){
	var controller, rec;

	function closeImmediately(w){
		if(!w.getEl()){
			return;
		}
		w.forceClosing = true;
		w.close();
	}

	beforeEach(function(){
		controller = app.getController('Store');
		rec = NextThought.model.store.Purchasable.create({NTIID: 'Purchasable_1'});
	});

	it('Should exist', function(){
		expect(controller).toBeDefined();
	});

	describe('Purchase window', function(){

		var pCollection, win;

		beforeEach(function(){
			pCollection = Ext.ComponentManager.create({
				xtype: 'purchasable-collection',
				name: 'Available for Purchase',
				listeners: {'select': Ext.emptyFn}
			});
			pCollection.fireEvent('select', pCollection, rec);
			win = controller.getPurchaseWindow();
		});

		afterEach(function(){
			closeImmediately(win);
			win.destroy();
		});

		describe('Showing purchase window', function(){

			it('Clicking purchasable menu item shows window', function(){
				expect(win).toBeDefined();
				expect(win.isVisible(true)).toBeTruthy();
				expect(win.record).toBe(rec);
			});

			it('Allows one window at a time', function(){
				var newRec = NextThought.model.store.Purchasable.create({});
				expect(controller.showPurchasable(newRec)).toBeFalsy();
			});
		});

		describe('Masking window safely', function(){

			it('Masks window', function(){
				expect(controller.safelyMaskWindow(win, 'mask')).toBeTruthy();
				expect(win.getEl().isMasked()).toBeTruthy();
			});

			it('Unmasks window', function(){
				expect(controller.safelyMaskWindow(win, 'mask')).toBeTruthy();
				expect(win.getEl().isMasked()).toBeTruthy();
				expect(controller.safelyUnmaskWindow(win)).toBeTruthy();
				expect(win.getEl().isMasked()).toBeFalsy();
			});

			it('Mask handles an unrendered window', function(){
				expect(controller.safelyMaskWindow(null)).toBeFalsy();
				spyOn(win, 'getEl').andReturn(null);
				expect(win.getEl()).toBeFalsy();
				expect(controller.safelyMaskWindow(win, 'mask')).toBeFalsy();
			});

			it('Unmask handles an unredered window', function(){
				expect(controller.safelyMaskWindow(win, 'foo')).toBeTruthy();
				spyOn(win, 'getEl').andReturn(null);
				expect(win.getEl()).toBeFalsy();
				expect(controller.safelyUnmaskWindow(win)).toBeFalsy();
			});
		});

		describe('Transitions to views', function(){

			it('Returns component added', function(){
				var a = controller.transitionToComponent(win, {xtype: 'purchase-complete'});
				expect(a).toBeTruthy();
				expect(a.xtype).toBe('purchase-complete');
			});

			it('Removes any old main views', function(){
				expect(win.items.getCount()).toBe(1);
				controller.transitionToComponent(win, {xtype: 'purchase-complete'});
				expect(win.items.getCount()).toBe(1);
			});
		});

		describe('Closing', function(){

			describe('closeWithoutWarn', function(){
				it('Closes immediately if components allows it', function(){
					var cmp = win.items.first();
					cmp.closeWithoutWarn = true;
					win.close();

					expect(win.getEl()).toBeFalsy();

				});
			});

			describe('Requires verification by default', function(){

				var cmp, alert, cancel, confirm;

				beforeEach(function(){
					cmp = win.items.first();
					cmp.closeWithoutWarn = false;
					win.close();

					alert = Ext.ComponentQuery.query('messagebox[activeUI=nti-alert]').first();
					cancel = Ext.ComponentQuery.query('messagebox[activeUI=nti-alert] [itemId=cancel]').first();
					confirm = Ext.ComponentQuery.query('messagebox[activeUI=nti-alert] [itemId=ok]').first();
				});

				function clickButton(btn){
					btn.onClick({type: 'mouse', button: 0, preventDefault: Ext.emptyFn})
				}

				it('Shows an alert and doesnt close', function(){
					expect(alert).toBeTruthy();
					expect(win.getEl()).toBeTruthy();
					clickButton(cancel);
				});

				it('Canceling verfication leaves window alone', function(){
					clickButton(cancel);
					expect(win.getEl()).toBeTruthy();
				});

				it('Confirming verfication closes it', function(){
					clickButton(confirm);
					expect(win.getEl()).toBeFalsy();
				});
			});
		});

		describe('Purchase flows', function(){

			var confirmBtn;

			beforeEach(function(){
				confirmBtn = win.confirmEl;
			});

			describe('Detail advances to form', function(){

				it('Starts on detail', function(){
					var cmp = win.items.first();
					expect(cmp).toBeTruthy();
					expect(cmp.xtype).toBe('purchase-detailview');
				});

				it('onConfirm transistions to form', function(){
					var cmp;
					win.onConfirm();
					cmp = win.items.first();
					expect(cmp).toBeTruthy();
					expect(cmp.xtype).toBe('purchase-form');
					expect(cmp.record).toBe(rec);
				});
			});

			describe('Confirm can transistion to edit', function(){

				var purchasable, token, pricing;

				beforeEach(function(){

					purchasable = {Purchasable: rec};
					token = {};
					pricing = {};

					controller.transitionToComponent(win, {
						xtype: 'purchase-confirm',
						purchaseDescription: purchasable,
						tokenObject: token,
						pricingInfo: pricing
					});
				});

				it('starts on confirm', function(){
					var cmp = win.items.first();
					expect(cmp).toBeTruthy();
					expect(cmp.xtype).toBe('purchase-confirm');
				});

				it('transaltes to form to edit', function(){
					var cmp = win.items.first();
					cmp.onEditOrder({stopEvent: Ext.emptyFn});
					cmp = win.items.first();
					expect(cmp).toBeTruthy();
					expect(cmp.xtype).toBe('purchase-form');
					expect(cmp.record).toBe(rec);
				});
			});
		});
	});

	describe('Pricing purchases', function(){

		//Returns an object with one function called
		//returnPricing that when called simulates a response
		//from the server with the args provided to this call
		function mockDoPricingRequest(){
			var fakeServer = {args : arguments};
			spyOn(controller, 'doPricingRequest').andCallFake(function(url, data, cb){
				fakeServer.returnPricing = function(){
					Ext.callback(cb, controller, fakeServer.args);
				}
			});

			return fakeServer;
		}

		var desc, win;

		beforeEach(function(){
			desc = {Purchasable: rec};
			win = NextThought.view.store.purchase.Window.create({record: rec});
		});

		afterEach(function(){
			closeImmediately(win);
			win.destroy();
		});

		describe('Locking', function(){

			var fakeServer;
			beforeEach(function(){
				fakeServer = mockDoPricingRequest({}, false, {});
			});

			it('Locks when sender is the window', function(){
				controller.pricePurchase(win, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(win.lockPurchaseAction).toBeTruthy();
			});

			it('Doesnt lock if controller is window', function(){
				controller.pricePurchase(controller, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(win.lockPurchaseAction).toBeUndefined();
			});

			it('If window is locked callling with window sender is noop', function(){
				var r;

				win.lockPurchaseAction = true;
				r = controller.pricePurchase(win, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(r).toBe(false);
				expect(controller.doPricingRequest).not.toHaveBeenCalled();
			});

			it('Lets the controller price even if window is locked', function(){
				controller.pricePurchase(controller, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(controller.doPricingRequest).toHaveBeenCalled();
			});
		});

		describe('Data payload', function(){

			var fakeServer;
			beforeEach(function(){
				fakeServer = mockDoPricingRequest({}, false, {});
			});

			it('Includes the purchasable id', function(){
				var expected = {purchasableID: 'Purchasable_1'};
				controller.pricePurchase(controller, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(controller.doPricingRequest).toHaveBeenCalledWith(jasmine.any(String), expected, jasmine.any(Function));
			});

			it('Includes quantities > 0 if specified', function(){
				var expected = {purchasableID: 'Purchasable_1', Quantity: 10};
				desc.Quantity = 10;
				controller.pricePurchase(controller, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(controller.doPricingRequest).toHaveBeenCalledWith(jasmine.any(String), expected, jasmine.any(Function));
			});

			it('Includes coupon code', function(){
				var expected = {purchasableID: 'Purchasable_1', Coupon: 'FOOBAR'};
				desc.Coupon = 'FOOBAR';
				controller.pricePurchase(controller, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(controller.doPricingRequest).toHaveBeenCalledWith(jasmine.any(String), expected, jasmine.any(Function));
			});

			it('Makes query to pricing link', function(){
				var u = desc.Purchasable.getLink('pricing');
				controller.pricePurchase(controller, desc, Ext.emptyFn, Ext.emptyFn, this);
				expect(controller.doPricingRequest).toHaveBeenCalledWith(u, jasmine.any(Object), jasmine.any(Function));
			});
		});

		describe('Pricing response', function(){

			var fakeServer, successCallback, failureCallback, scope;

			beforeEach(function(){
				scope = {};
				successCallback = jasmine.createSpy('successCallback');
				failureCallback = jasmine.createSpy('failureCallback');
			});

			describe('error conditions', function(){
				it('handles error response by calling failure callback', function(){
					fakeServer = mockDoPricingRequest({}, false, {});
					controller.pricePurchase(controller, desc, successCallback, failureCallback, scope);
					fakeServer.returnPricing();

					expect(failureCallback).toHaveBeenCalled();
					expect(successCallback).not.toHaveBeenCalled();
				});

				it('handles bad data in a succesful resposne', function(){
					var resp = {};
					resp.responseText = '{"Class": "Note"}';


					fakeServer = mockDoPricingRequest({}, true, resp);
					controller.pricePurchase(controller, desc, successCallback, failureCallback, scope);
					fakeServer.returnPricing();

					expect(failureCallback).toHaveBeenCalled();
					expect(successCallback).not.toHaveBeenCalled();
				});

				it('handles explosions in parsing', function(){
					spyOn(ParseUtils, 'parseItems').andCallFake(function(){
						Ext.Error.raise('Boom');
					});
					fakeServer = mockDoPricingRequest({}, true, {responseText: ''});
					controller.pricePurchase(controller, desc, successCallback, failureCallback, scope);
					fakeServer.returnPricing();

					expect(failureCallback).toHaveBeenCalled();
					expect(successCallback).not.toHaveBeenCalled();
				});

				it('handles explosions in initial request', function(){
					spyOn(controller, 'doPricingRequest').andCallFake(function(){
						Ext.Error.raise('Boom');
					});
					controller.pricePurchase(controller, desc, successCallback, failureCallback, scope);
					fakeServer.returnPricing();

					expect(failureCallback).toHaveBeenCalled();
					expect(successCallback).not.toHaveBeenCalled();
				});
			});

			describe('success conditions', function(){
				it('calls success with pricing info model', function(){
					var resp = {},
						pricedObject;

					resp.responseText = '{"Amount": 90000.0, "Class": "StripePricedPurchasable", "Coupon": null, "Currency": "USD", "MimeType": "application/vnd.nextthought.stripepricedpurchasable", "NTIID": "tag:nextthought.com,2011-10:PRMIA-HTML-PRMIA_RiskCourse.advanced_stress_testing_for_financial_institutions", "Provider": "NTI-TEST", "PurchasePrice": 90000.0, "Quantity": 1}';
					fakeServer = mockDoPricingRequest({}, true, resp);

					controller.pricePurchase(controller, desc, successCallback, failureCallback, scope);
					fakeServer.returnPricing();

					expect(failureCallback).not.toHaveBeenCalled();
					expect(successCallback).toHaveBeenCalled();

					pricedObject = successCallback.argsForCall[0][0];

					expect(pricedObject.isPricedPurchase).toBeTruthy();
				});
			});
		});
	});
});
