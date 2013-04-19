describe('Purchasable model tests', function(){
	describe('Hacks in a pricing link', function(){
		var purchasable = NextThought.model.store.Purchasable.create({});

		it('Has a pricing link', function(){
			expect(purchasable.getLink('pricing')).toBeTruthy();
		});

		it('Has a purchase link', function(){
			expect(purchasable.getLink('purchase')).toBeTruthy();
		});

		it('Uses the standard mixin for other', function(){
			expect(purchasable.getLink('like')).toBeFalsy();
		});
	})
});
