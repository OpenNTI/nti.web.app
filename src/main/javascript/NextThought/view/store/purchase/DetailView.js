Ext.define('NextThought.view.store.purchase.DetailView',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-detailview',

	ui: 'detailview-panel',

	renderTpl: '{Description}',

	checkboxLabel: Ext.DomHelper.markup([
		'I have an ',
		{
			tag: 'a',
			cls: 'activation',
		 	href: '#',
		 	html: 'Activation Key.',
			cn: [{ cls: 'desc', html: 'An activation key is a key code that gives you access to purchased content.'}]
		}
	]),

	checkboxAction: 'toggleActivationCode',
	confirmLabel: 'Purchase',
	closeWithoutWarn: true,

	ordinal: 0,

	initComponent: function(){
		this.callParent(arguments);
		this.setupRenderData();

		if(this.record.get('Activated')){
			this.checkboxLabel = null;
		}
	},


	setupRenderData: function(){
		this.renderData = Ext.apply(this.renderData || {}, {
			Description: this.record.get('Description')
		});
	},


	onConfirm: function(win, activationCode, checkState){
		var code = (activationCode || '').trim();
		if(checkState && code){
			this.fireEvent('purchase-with-activation', this, this.record, code);
		}
		else{
			this.fireEvent('show-purchase-form', this, this.record);
		}
	},


	onCheckboxLinkClicked: function(){
		console.log('show help for what is an activation key...');
	}
});
