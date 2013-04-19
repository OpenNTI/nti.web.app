describe('PurchaseAttempt model tests', function(){
	describe('Hacks in a get_purchase_attempt link', function(){
		var purchaseAttempt = NextThought.model.store.PurchaseAttempt.create({NTIID: 'FOO'});

		it('Has a get_purchase_attempt link', function(){
			expect(purchaseAttempt.getLink('get_purchase_attempt')).toBeTruthy();
			expect(purchaseAttempt.getLink('get_purchase_attempt')).toBe('mock/dataserver2/store/get_purchase_attempt?purchaseID=FOO');
		});

		it('Uses the standard mixin for other', function(){
			expect(purchaseAttempt.getLink('like')).toBeFalsy();
		});
	});

	describe('State functions', function(){

		function attemptWithState(s){
			return NextThought.model.store.PurchaseAttempt.create({State: s});
		}

		it('isSuccess', function(){
			expect(attemptWithState('Success').isSuccess()).toBeTruthy();
			expect(attemptWithState('Unknown').isSuccess()).toBeFalsy();
			expect(attemptWithState('Failed').isSuccess()).toBeFalsy();
		});

		it('isFailure', function(){
			expect(attemptWithState('Success').isFailure()).toBeFalsy();
			expect(attemptWithState('Unknown').isFailure()).toBeFalsy();
			expect(attemptWithState('Failed').isFailure()).toBeTruthy();
		});

		it('isComplete', function(){
			expect(attemptWithState('Success').isComplete()).toBeTruthy();
			expect(attemptWithState('Unknown').isComplete()).toBeFalsy();
			expect(attemptWithState('Failed').isComplete()).toBeTruthy();
			expect(attemptWithState('Started').isComplete()).toBeFalsy();
		});

	});
});
