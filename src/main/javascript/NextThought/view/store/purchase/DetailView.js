Ext.define('NextThought.view.store.purchase.DetailView',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-detailview',

	ui: 'detailview-panel',

	renderTpl: '{Description}',

	checkboxLabel: Ext.DomHelper.markup(['I have an ',{tag:'a',href:'#',html:'Activation Key.'}]),

	checkboxAction: 'toggleActivationCode',
	confirmLabel: 'Purchase',
	closeWithoutWarn: true,

	ordinal: 0,

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			Description: this.record.get('Description')
		});
	},

	onConfirm: function(cmp, activationCode, checkBoxState){
		this.fireEvent('show-purchase-form', this, this.record);
	},


	onCheckboxLinkClicked: function(){
		console.log('show help for what is an activation key...');
	}
});
