describe('PurchaseAttempt model tests', function(){
	describe('Hacks in a get_purchase_attempt link', function(){
		var purchaseAttempt = NextThought.model.store.PurchaseAttempt.create({});

		it('Has a get_purchase_attempt link', function(){
			expect(purchaseAttempt.getLink('get_purchase_attempt')).toBeTruthy();
		});

		it('Uses the standard mixin for other', function(){
			expect(purchaseAttempt.getLink('like')).toBeFalsy();
		});
	})
});
