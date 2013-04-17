Ext.define('NextThought.view.store.purchase.Complete',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-complete',

	ui: 'purchasecomplete-panel',

	renderTpl: 'Hooray revenue',

	ordinal: 3,

	onConfirm: function(){
		this.fireEvent('close', this);
	}
});
