Ext.define('NextThought.view.store.purchase.Complete',{
	extend: 'Ext.Component',
	alias: 'widget.purchase-complete',

	ui: 'purchasecomplete-panel',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'tpl', 'if': 'activation', cn: [
			{ tag: 'h3', cls:'gap', html: 'Activation Successful!'},
			{ html: 'Your content has been added to your library.'}
		]},
		{ tag: 'tpl', 'if': '!activation', cn: [
			{ tag: 'h3', cls:'gap', html: 'Thank you for your purchase!'},
			{ html: '{message} You will receive an emailed receipt shortly. Please store it for your records.'}
		]},
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
		var w;
		this.callParent(arguments);

		var a = 'Your content has been added to your library.',
			b = 'Your Activation Key has been created.',
			code = false;

		if(this.purchaseAttempt && this.purchaseAttempt.isPurchaseAttempt){
			code = this.purchaseAttempt.get('InvitationCode');
			if(code){
				a = b;
			}
		}

		if(!this.purchaseAttempt){
			w = this.up('window');
			if(w){
				w.addCls('activation-complete');
				w.updateTabTitleForChild(this, 'Activated');
			}

		}

		this.renderData = Ext.apply(this.renderData||{},{
			message: a,
			key: code,
			activation: !this.purchaseAttempt
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
			this.keyEl.on('contextmenu',function(e){e.stopPropagation();});
		}

		win = this.up('window');
		win.headerEl.select('.tab').addCls('visited locked');
	},


	onNavigateToNewlyPurchasedContentClicked: function(e){
		var purchasable = this.purchaseDescription && this.purchaseDescription.Purchasable,
			items = purchasable && purchasable.get('Items');
		e.stopEvent();

		//Again with these damn assumptions
		if(items.length > 1){
			console.log('More than one item for this purchasable.  Content roulette', items);
		}

		items = items.first();
		if(items){
			LocationProvider.setLocation(items);
			this.up('window').close();
		}

		return false;
	}
});
