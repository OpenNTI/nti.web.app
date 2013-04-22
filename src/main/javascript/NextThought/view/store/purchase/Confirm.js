Ext.define('NextThought.view.store.purchase.Confirm',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-confirm',

	ordinal: 2,
	confirmLabel: 'Complete',
	showColumns: true,

	ui: 'purchaseconfirm-panel',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'tpl', 'if':'code', cn:
			{ cls: 'coupon', html: 'Code {code} reduced your total by {reduction}'}},
		{ cls: 'message', cn:[
			'{message}',
			{tag:'br'},
			'Pleae carefully review and submit your order.'
		]},
		{tag: 'fieldset', cls:'div', cn:[
			{ tag: 'legend', cls:'card', html: 'Payment Information' },
			{ cn: [{ 'data-label': 'Name on card', html:'{name}' }] },
			{ cn: [
				{ tag:'span', 'data-label': '{type}', html:'xxxx - xxxx - xxxx - {last4}' },
				{ tag:'span', 'data-label': 'Expires', html: '{exp_month} / {exp_year}' }
			]}
		]},
		{tag: 'fieldset', cls:'div', cn:[
			{tag: 'legend', cls:'location', html: 'Billing Address'},
			{ html: '{name}'},
			{ html: '{address_line1}'},
			{ html: '{address_line2}'},
			{ cn:[
				{ tag: 'tpl', 'if':'address_city', html:'{address_city} '},
				{ tag: 'tpl', 'if':'address_state', html:'{address_state}, '},
				{ tag: 'tpl', 'if':'address_zip', html:'{address_zip}'}
			]},
			{ html: '{address_country}'}
		]},
		{ cn:[{tag: 'a', cls:'edit', href:'#', html: 'Edit this order'}] }
	]),


	renderSelectors: {
		editLinkEl: 'a.edit'
	},


	beforeRender: function(){
		var quantity, times, coupon;
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},((this.tokenObject||{}).card||{}));

		if(this.purchaseDescription && this.purchaseDescription.Quantity !== undefined){
			quantity = this.purchaseDescription.Quantity;
			times = Ext.util.Format.plural(quantity, 'time');
			this.renderData.message = 'An activation code will be generated that can be used to gain access to the content' +
				' at a later date.  This code will work ' + times +'.';
		}
		else{
			this.renderData.message = 'Your licence will be automatically activated for this acount.';
		}

		coupon = (this.pricingInfo && this.pricingInfo.get) ? this.pricingInfo.get('Coupon') : undefined;
		if(Ext.isObject(coupon)){
			try{
				this.renderData.code = coupon.ID;
				this.renderData.reduction = NTIFormat.formatCurrency(this.pricingInfo.calculatePurchaseDiscount(),
					this.pricingInfo.get('Currency'));
			}
			catch(e){
				delete this.renderData.code;
				console.error('Unable to calculate savings for display', Globals.getError(e));
			}

		}
//		this.renderData.code = 'PRE10';
//		this.renderData.reduction = '$5.00';
	},


	afterRender: function(){
		this.callParent(arguments);
		this.mon(this.editLinkEl,'click',this.onEditOrder,this);
	},


	onEditOrder: function(e){
		e.stopEvent();
		this.fireEvent('edit-purchase', this, this.purchaseDescription, this.tokenObject);
		return false;
	},


	onConfirm: function(){
		this.fireEvent('process-purchase', this, this.purchaseDescription, this.tokenObject, this.pricingInfo);
	}
});
