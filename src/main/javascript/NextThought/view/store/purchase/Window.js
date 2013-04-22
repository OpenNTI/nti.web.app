Ext.define('NextThought.view.store.purchase.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.purchase-window',

	requires: [
		'NextThought.layout.component.Natural',
		'NextThought.view.store.purchase.DetailView'
	],

	cls:'purchase-window',
	width: 520,
	height: 690,
	autoShow: true,
	resizable: false,
	draggable: false,
	modal: true,
	dialog: true,
	managed: false,

	childEls: ['body'],
	getTargetEl: function () { return this.body; },

	renderTpl: Ext.DomHelper.markup([{
		cls: 'header', cn:[
			{ cls: 'titlebar', cn:[
				{ cls:'tab visited', html:'Course Details' },
				{ cls:'tab', html:'Payment Info', 'data-order':1 },
				{ cls:'tab', html:'Review Order', 'data-order':2 },
				{ cls:'tab', html:'Confirmation', 'data-order':3 },
				{ cls: 'close' }
			]},
			{ cls: 'columns',cn:[
				{cls:'a', html:'Item'},
				{cls:'b', html:'Quantity'},
				{cls:'c', html:'Total Price'}
			]},
			{ cls: 'info', cn:[
				{ cls:'bookcover', style: {backgroundImage: 'url({Icon})'} },
				{cls: 'price', html:'{[NTIFormat.formatCurrency((values.price||values.Amount), values.Currency)]}'},
				{cls: 'quantity', html:'{quantity}'},
				{ cls:'meta', cn:[
					{cls: 'title', html: '{Title}'},
					{cls: 'byline', html: 'By {[values.Author||values.Provider]}'},
					{cls: 'activation-code', cn:[
						{tag: 'input', type:'text', name:'activation', 'data-required':true, cls:'required'}
					]}
				]}
			] }
		]
	},{
		id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
	},{
		cls:'error', cn:[{cls:'label'},{cls:'message'}]
	},{
		cls: 'footer', cn: [
			{tag:'label', cls: 'agree', cn:[
				{tag: 'input', type: 'checkbox'},{}
			]},
			{tag:'a', cls:'button cancel',role:'button', html:'Cancel'},
			{tag:'a', cls:'button confirm',role:'button', html:'Purchase'}
		]
	}]),

	renderSelectors: {
		headerEl: '.header',
		closeEl: '.header .titlebar .close',

		footerEl: '.footer',
		cancelEl: '.footer a.cancel',
		confirmEl: '.footer a.confirm',

		errorEl: '.error',
		errorLabelEl: '.error .label',
		errorMessageEl: '.error .message',

		checkboxLabelEl: '.footer label input + div',
		checkboxEl: '.footer label input',
		checkboxBoxEl: '.footer label'
	},

	componentLayout: 'natural',
	layout: 'auto',
	items: [],


	getDockedItems: function(){
		return [];
	},


	listeners: {
//		show: 'addCustomMask',
//		close: 'removeCustomMask',
		afterRender: 'center'
	},


	beforeRender: function(){
		this.callParent(arguments);
		this.renderData = Ext.applyIf(this.renderData||{},this.record.getData());
	},


	afterRender: function(){
		var me = this;
		me.callParent(arguments);
		me.mon(me.closeEl,'click','close',me);
		me.mon(me.cancelEl,'click','close',me);
		me.mon(me.confirmEl,'click','onConfirm',me);
		me.getEl().select('.titlebar .tab').each(function(e){
			me.mon(e,'click','onTabClicked',me);
		});

		this.add({xtype: 'purchase-detailview', record: this.record});
		this.errorEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
		this.errorEl.hide();
		this.updateContentHeight();
	},


	publishQuantityAndPrice: function(quantity, price, currency){
		this.priceInfo = {
			quantity: quantity,
			price: price
		};

		if(!this.rendered){
			this.renderData = Ext.apply(this.renderData||{},this.priceInfo);
			return;
		}

		this.headerEl.select('.quantity').update(quantity||1);
		this.headerEl.select('.price').update(NTIFormat.formatCurrency(price, currency));
	},


	updateContentHeight: function(){
		var el = this.getTargetEl(),
			h = this.footerEl.getY() - el.getY();
		el.setHeight(h);
	},


	hideError: function(){
		this.updateContentHeight();
		this.errorEl.hide();
	},


	showError: function(message, label){
		var el = this.getTargetEl(),
			errorEl = this.errorEl;
		function syncHeight(){
			var h = errorEl.getY() - el.getY();
			el.setHeight(h);
		}

		this.errorLabelEl.update(label||'Error:');
		this.errorMessageEl.update(message||'');

		errorEl.show();
		Ext.defer(syncHeight,1);
	},


	onAdd: function(cmp){
		var ordinal = cmp.ordinal,
			confirmLabel = cmp.confirmLabel || 'Purchase',
			checkLabel = cmp.checkboxLabel;

		this.activeView = cmp;

		if(this.rendered){
			this.checkboxEl.dom.checked = false;
			this.checkboxLabelEl.update(checkLabel||'');
			this.checkboxBoxEl[checkLabel?'addCls':'removeCls']('active');

			this.headerEl[cmp.showColumns ? 'addCls':'removeCls']('show-columns');
			this.headerEl[cmp.finalPrice ? 'addCls':'removeCls']('final-price');

			this.syncTab(ordinal);
			this.confirmEl.update(confirmLabel);
			this.confirmEl[cmp.omitCancel? 'addCls': 'removeCls']('alt');
			this.cancelEl[cmp.omitCancel ? 'hide' : 'show']();
			Ext.defer(this.updateContentHeight,1,this);
		}
	},


	syncTab: function(ordinal){
		var el = this.getEl(),
			tabs = el.select('.titlebar .tab');

		if(ordinal>0){
			el.select('.titlebar').addCls('started');
			el.select('.titlebar .tab.active').addCls('visited');
		}

		tabs.removeCls('active');
		tabs.item(ordinal || 0).addCls('active');

	},


	onConfirm: function(){
		if(this.confirmEl.hasCls('disabled')){
			return;
		}

		this.down('[onConfirm]').onConfirm();
	},


	onTabClicked: function(e){
		var t = e.getTarget('.tab');
		t = (t && t.getAttribute('data-order')) || 0;
		console.log('go to page: '+t);
	},


	addCustomMask: function(){
		var mask = this.zIndexManager.mask;
		if(mask){
			mask.addCls('nti-black-clear');
		}
	},

	removeCustomMask: function(){
		var mask = this.zIndexManager.mask;
		if(mask){
			mask.removeCls('nti-black-clear');
		}
	},


	setConfirmState: function(enabled){
		if(this.confirmEl){
			this.confirmEl[!enabled ? 'addCls' : 'removeCls']('disabled');
		}
	}
});
