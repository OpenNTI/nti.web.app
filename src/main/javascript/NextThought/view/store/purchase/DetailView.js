Ext.define('NextThought.view.store.purchase.DetailView',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-detailview',

	ui: 'detailview-panel',

	renderTpl: '{Description}',

	checkboxLabel: Ext.DomHelper.markup(['I have an ',{tag:'a',href:'#',html:'Activation Key.'}]),

	closeWithoutWarn: true,

	ordinal: 0,

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			Description: this.record.get('Description')
		});
	},

	onConfirm: function(){
		this.fireEvent('show-purchase-form', this, this.record);
	}
});
