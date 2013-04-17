Ext.define('NextThought.view.store.purchase.Confirm',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-confirm',

	ui: 'purchaseconfirm-panel',

	renderTpl: 'Confirm body here / errors',

	ordinal: 2,

	onConfirm: function(){
		this.fireEvent('process-purchase', this, this.record, this.tokenObject);
	}
});
