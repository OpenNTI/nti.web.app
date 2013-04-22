Ext.define('NextThought.model.store.StripePricedPurchasable', {
	extend: 'NextThought.model.Base',

	fields: [
		{ name: 'Amount', type: 'float', persist: false },
		{ name: 'Coupon', type: 'auto', persist: false, defaultValue: undefined},
		{ name: 'Currency', type: 'string', persist: false },
		{ name: 'Provider', type: 'string', persist: false },
		{ name: 'PurchasePrice', type: 'float', persist: false },
		{ name: 'NonDiscountedPrice', type: 'float', persist: false, useNull: true, defaultValue: undefined },
		{ name: 'Quantity', type: 'int', persist: false }
	],

	isPricedPurchase: true,

	//Returns the different between NonDiscountedPrice and PurchasePrice.
	//if either is not defined an exception is raised.  Also if purchase price is >
	//NonDiscountedPrice an exception is raised
	calculatePurchaseDiscount: function(){
		var pp = this.get('PurchasePrice'),
			ndp = this.get('NonDiscountedPrice');

		if(!Ext.isNumber(pp) || !Ext.isNumber(ndp)){
			Ext.Error.raise('Need numbers for PurchasePrice and NonDiscountedPrice to calulate savings');
		}

		if(pp > ndp){
			Ext.Error.raise('PurchasePrice should not be greator than NonDiscountedPrice');
		}

		return ndp - pp;
	}
});
