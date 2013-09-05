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
		{tag:'tpl', 'if': '!bulkOrder', cn:[
			{ cls: 'message', cn:[
				'{message}',
				{tag:'br'},
				'Please carefully review and submit your order.', {tag:'br'},
				'Please note that no refunds will be issued for purchases.'
			]}
		]},
		{tag:'tpl', 'if': 'bulkOrder', cn:[
			{ cls: 'message', cn:[
				'Please review your order. Once submitted, you will receive an activation key to access your purchased items. ',
				'This key will work ',
				'{message}',
				'. Please note that all sales are final.'
			]}
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
			this.renderData.bulkOrder = true;
			this.renderData.message = times;
		}
		else{
			this.renderData.bulkOrder = false;
			this.renderData.message = 'Your license will be activated automatically for this account.';
		}

		coupon = (this.pricingInfo && this.pricingInfo.get) ? this.pricingInfo.get('Coupon') : undefined;
		if(Ext.isObject(coupon)){
			try{
				this.renderData.code = coupon.ID;
				this.renderData.reduction = NTIFormat.currency(this.pricingInfo.calculatePurchaseDiscount(),
					this.pricingInfo.get('Currency'));
			}
			catch(e){
				delete this.renderData.code;
				console.error('Unable to calculate savings for display', Globals.getError(e));
			}

		}
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
