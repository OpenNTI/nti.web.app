describe('StripePricedPurchasable model tests', function(){
	it('is a priced purchase', function(){
		var rec = NextThought.model.store.StripePricedPurchasable.create({});
		expect(rec.isPricedPurchase).toBeTruthy();
	});

	describe('calculatePurchaseDiscount', function(){

		function createRecWithValues(pp, ndp){
			var rec;
			rec = NextThought.model.store.StripePricedPurchasable.create({PurchasePrice: pp, NonDiscountedPrice: ndp});
			return rec;
		}

		it('throws if PurchasePrice of NonDiscountedPrice are missing', function(){
			var rec = createRecWithValues();
			expect(Ext.Function.bind(rec.calculatePurchaseDiscount, rec)).toThrow();
		});

		it('throws if PurchasePrice is greator than NonDiscountedPrice', function(){
			var rec = createRecWithValues(100.00, 50);
			expect(Ext.Function.bind(rec.calculatePurchaseDiscount, rec)).toThrow();
		});

		it('Handles saving 0', function(){
			var rec = createRecWithValues(75, 75.0);
			expect(rec.calculatePurchaseDiscount()).toBe(0);
		});

		it('Calculates properly', function(){
			var rec = createRecWithValues(50.99, 100);
			expect(rec.calculatePurchaseDiscount()).toBe(49.01);
		});
	});
});
