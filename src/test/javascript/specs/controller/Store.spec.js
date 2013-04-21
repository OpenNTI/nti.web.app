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
			w.forceClose = true;
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
	});
});
