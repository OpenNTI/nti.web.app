Ext.define('NextThought.view.store.purchase.Complete',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-complete',

	ui: 'purchasecomplete-panel',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'h3', cls:'gap', html: 'Thank you for your purchase!'},
		{ html: '{message} You will receive an email receipt shortly, store it for your records.'},
		{ cls:'gap', cn: [
			{tag:'tpl', 'if':'!key', cn:{ tag: 'a', href:'#', html:'View your content now!' }},
			{tag:'tpl', 'if':'key', cn:{ cls:'activation-key', html:'{key}', 'data-label':'Activation Key' }}
		]}
	]),


	renderSelectors:{
		linkEl: 'a[href]',
		keyEl: '.activation-key'
	},


	ordinal: 3,
	confirmLabel: 'Close',
	omitCancel: true,
	closeWithoutWarn: true,
	showColumns: true,
	finalPrice: true,

	onConfirm: function(){
		this.fireEvent('close', this);
	},

	beforeRender: function(){
		this.callParent(arguments);

		var a = 'Your content has been added to your library.',
			b = 'Your Activation Key has been created.',
			code = false;

		if(this.purchaseAttempt && this.purchaseAttempt.isPurchaseAttempt){
			a = b;
			code = this.purchaseAttempt.get('InvitationCode');
		}

		this.renderData = Ext.apply(this.renderData||{},{
			message: a,
			key: code
		});
	},


	afterRender: function(){
		var win;
		this.callParent(arguments);

		if(this.linkEl){
			this.mon(this.linkEl,'click','onNavigateToNewlyPurchasedContentClicked',this);
		}

		if(this.keyEl){
			this.keyEl.selectable();
		}

		win = this.up('window');
		win.headerEl.select('.tab').addCls('visited locked');
	},


	onNavigateToNewlyPurchasedContentClicked: function(e){
		e.stopEvent();
		console.log('Go to content');
		return false;
	}
});
