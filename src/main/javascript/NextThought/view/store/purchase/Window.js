Ext.define('NextThought.view.store.purchase.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.purchase-window',

	mixins:{
		placeholderFix: 'NextThought.view.form.fields.PlaceholderPolyfill'
	},

	requires: [
		'NextThought.layout.component.Natural',
		'NextThought.view.store.purchase.DetailView',
		'NextThought.view.store.purchase.History'
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
				{ cls:'tab visited', html:'Course Details', 'data-order':'detail', 'data-no-decoration':true },
				{ cls:'tab', html:'Purchase History', 'data-order':'history', 'data-no-decoration':true },
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
				{cls: 'price', html:'{[NTIFormat.currency((values.price||values.Amount), values.Currency)]}'},
				{cls: 'quantity', html:'{quantity}'},
				{ cls:'meta', cn:[
					{cls: 'title', html: '{Title}'},
					{cls: 'byline', html: 'By {[values.Author||values.Provider]}'},
					{cls: 'activation-code', cn:[
						{tag: 'input', type:'text', name:'activation', placeholder:'Activation Code',
							//To discourage attacks, give no indication that this is a valid/invalid code until submission.
							'data-required':true, cls:'required valid'}
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
			{tag:'a', cls:'button confirm',role:'button', html:''}
		]
	}]),

	renderSelectors: {
		headerEl: '.header',
		closeEl: '.header .titlebar .close',

		footerEl: '.footer',
		cancelEl: '.footer a.cancel',
		confirmEl: '.footer a.confirm',

		activationCodeEl: '.activation-code input',

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

		me.renderPlaceholder(me.activationCodeEl);
		me.activationCodeEl.allowContextMenu();

		me.mon(me.activationCodeEl,'keyup','onActivationCodeChange',me,{buffer: 500});
		me.mon(me.activationCodeEl,'keypress','onActivationCodeChange',me,{buffer: 500});
		me.mon(me.checkboxBoxEl,'click','onCheckboxClicked',me);

		if( this.showHistory ){
			this.add({xtype: 'purchase-history', record: this.record});
			this.el.select('.titlebar').addCls('show-history');
		}
		else {
			this.add({xtype: 'purchase-detailview', record: this.record});
		}

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
		this.headerEl.select('.price').update(NTIFormat.currency(price, currency));
	},


	updateContentHeight: function(){
		var el = this.getTargetEl(),
			h = this.footerEl.getY() - el.getY();
		el.setHeight(h);
		this.getEl().repaint();
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
			this.setConfirmState(true);
			this.checkboxEl.dom.checked = false;
			this.checkboxLabelEl.update(checkLabel||'');
			this.checkboxBoxEl[checkLabel?'addCls':'removeCls']('active');

			this.headerEl[cmp.showColumns ? 'addCls':'removeCls']('show-columns');
			this.headerEl[cmp.finalPrice ? 'addCls':'removeCls']('final-price');
			this.headerEl.removeCls('show-activation-code');

			this.syncTab(ordinal);
			this.confirmEl.update(confirmLabel);
			this.confirmEl[cmp.omitCancel? 'addCls': 'removeCls']('alt');
			this.cancelEl[cmp.omitCancel ? 'hide' : 'show']();
			Ext.defer(this.updateContentHeight,1,this);
		}
	},


	syncTab: function(ordinal){
		var el = this.getEl(),
			tabs = el.select('.titlebar .tab'),
			defaultTab = this.started ? 0 : 'detail';

		if(ordinal>0){
			this.started = true;
			el.select('.titlebar').addCls('started').removeCls('show-history');
			el.select('.titlebar .tab.active').addCls('visited');
		}

		tabs.removeCls('active');
		el.select('.titlebar .tab[data-order="'+(ordinal || defaultTab)+'"]').addCls('active');

		if( ordinal==='history' ){
			ordinal = 4;
			tabs.removeCls('locked').addCls('visited');
			return;
		}

		tabs.each(function(t, c){
			var i = t.getAttribute('data-order');
			if(i==='history'){ i=4; }
			else {
				if(i === 'detail'){
					i = 0;
				}
				t[i<ordinal  ? 'removeCls' : 'addCls']('locked');
			}
			if(i>=ordinal){
				t.removeCls('visited');
			}
		});
	},


	onActivationCodeChange: function(){
		var code = this.activationCodeEl.getValue();
		console.log('Code:', code);
		this.setConfirmState(!Ext.isEmpty(code.trim()));
	},


	onConfirm: function(){
		if(this.confirmEl.hasCls('disabled')){
			return;
		}

		var checkState = this.checkboxEl.dom.checked,
			activationCode = this.activationCodeEl.getValue();

		this.down('[onConfirm]').onConfirm( this, activationCode, checkState );
	},


	onTabClicked: function(e){
		var target = e.getTarget('.tab'),
			cmp = this.activeView,
			currentOrdinal = cmp ? cmp.ordinal : -1,
			t = target;
		t = (t && t.getAttribute('data-order')) || 0;

		if(t >= currentOrdinal){
			console.warn('Cant go forward', t, currentOrdinal);
			return;
		}

		if(Ext.fly(target).is('.locked')){
			console.warn('Tab locked', target);
			return;
		}

		console.log('go to page: '+t);
		this.fireEvent('show-purchase-view', this, t, {
				purchaseDescription: cmp.purchaseDescription,
				tokenObject: cmp.tokenObject,
				record: this.record
			}
		);
	},


	setConfirmState: function(enabled){
		if(this.confirmEl){
			this.confirmEl[!enabled ? 'addCls' : 'removeCls']('disabled');
		}
	},


	onCheckboxClicked: function(e){
		var t = e.getTarget(),
			active = this.activeView,
			linkClicked = (active && active.onCheckboxLinkClicked) || Ext.emptyFn;

		if(t.tagName ==='A'){
			e.stopEvent();
			Ext.callback(linkClicked,active,[this]);
			return false;
		}

		Ext.defer(this.updateContentHeight,1,this);
		(this[active.checkboxAction||'none'] || Ext.emptyFn).call(this);
		return true;
	},


	toggleActivationCode: function(){
		var c = this.checkboxEl.dom.checked;
		this.confirmEl.update(c? 'Activate':this.activeView.confirmLabel);
		this.headerEl[c?'addCls':'removeCls']('show-activation-code');
		if(c){
			this.onActivationCodeChange();
		}
		else{
			this.setConfirmState(true);
		}
	},


	updateTabTitleForChild: function(cmp, text){
		var ordinal = cmp.ordinal,
			t = this.headerEl.down('.titlebar .tab[data-order='+ordinal+']');

		if(t){
			t.update(text);
		}
	},


	agreeToTerms: function(){
		var c = this.checkboxEl.dom.checked,
			a = this.activeView;
		Ext.callback(a && a.setAgreementState,a,[c]);
	}
});
