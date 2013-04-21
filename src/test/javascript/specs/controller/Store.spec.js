describe('Store controller', function(){
	var controller;

	beforeEach(function(){
		controller = app.getController('Store');
	});

	it('Should exist', function(){
		expect(controller).toBeDefined();
	});

	describe('Purchase window', function(){

		var pCollection, rec, win;

		beforeEach(function(){
			pCollection = Ext.ComponentManager.create({
				xtype: 'purchasable-collection',
				name: 'Available for Purchase',
				listeners: {'select': Ext.emptyFn}
			});
			rec = NextThought.model.store.Purchasable.create({});
			pCollection.fireEvent('select', pCollection, rec);
			win = controller.getPurchaseWindow();
		});

		afterEach(function(){
			closeImmediately(win);
			win.destroy();
		});

		function closeImmediately(w){
			if(!w.getEl()){
				return;
			}
			w.forceClosing = true;
			w.close();
		}

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
	});
});
