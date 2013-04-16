Ext.define('NextThought.view.store.purchase.DetailView',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-detailview',

	ui: 'detailview-panel',

	renderTpl: '{Description}',

	closeWithoutWarn: true,

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			Description: this.record.get('Description')
		});
	}
});
