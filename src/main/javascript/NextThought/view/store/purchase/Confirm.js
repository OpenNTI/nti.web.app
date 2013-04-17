Ext.define('NextThought.view.store.purchase.Confirm',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-confirm',

	ordinal: 2,
	ui: 'purchaseconfirm-panel',

	renderTpl: Ext.DomHelper.markup([
		{tag: 'fieldset', cn:[
			{ tag: 'legend', html: 'Payment Information' },
			{ cn: [{ 'data-label': 'Name on card', html:'{name}' }] },
			{ cn: [
				{ tag:'span', 'data-label': 'Card Number', html:'enging in {last4}' },
				{ tag:'span', 'data-label': 'Expiry', html: '{exp_month} / {exp_year}' },
				{ tag:'span', 'data-label': 'Code', html: '{cvc}' }
			]}
		]},
		{tag: 'fieldset', cn:[
			{tag: 'legend', html: 'Billing Address'},
			{'data-label': 'Address', html: '{address_line1}\n{address_line2}' },
			{'data-label': 'City / Town', html: '{address_city}'},
			{'data-label': 'State / Province / Territory / Region', html: '{address_state}'},
			{cn: [
				{ tag:'span', 'data-label': 'Country', html: '{address_country}'},
				{ tag:'span', 'data-label': 'ZIP / Postal Code', html: '{address_zip}'}
			]}
		]}
	]),


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{},((this.tokenObject||{}).card||{}));
	},


	onConfirm: function(){
		this.fireEvent('process-purchase', this, this.record, this.tokenObject);
	}
});
