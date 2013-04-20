describe('Store controller', function(){
	var controller;

	beforeEach(function(){
		controller = app.getController('Store');
	});

	it('Should exist', function(){
		expect(controller).toBeDefined();
	});

	describe('Purchase window', function(){

		describe('Showing purchase window', function(){

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
				win.forceClose = true;
				win.close();
			});

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
	});
});
