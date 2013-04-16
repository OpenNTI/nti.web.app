Ext.define('NextThought.view.store.purchase.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.purchase-window',

	requires: [
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
				{ cls:'tab active', html:'Course Details' },
				{ cls:'tab', html:'Payment Info', 'data-order':1 },
				{ cls:'tab', html:'Review Order', 'data-order':2 },
				{ cls:'tab', html:'Confirmation', 'data-order':3 },
				{ cls: 'close' }
			]},
			{ cls: 'info', cn:[
				{ cls:'bookcover', style: {backgroundImage: 'url({Icon})'} },
				{ cls:'meta', cn:[
					{cls: 'title', html: '{Title}'},
					{cls: 'byline', html: 'By {Author}, {Provider}'},
					{cls: 'price', html:'${Amount}'}
				]}
			] }
		]
	},{
		id: '{id}-body', cls: 'container-body', html: '{%this.renderContainer(out,values)%}'
	},{
		cls: 'footer', cn: [
			{tag:'a', cls:'button cancel',role:'button', html:'Cancel'},
			{tag:'a', cls:'button confirm',role:'button', html:'Purchase'}
		]
	}]),

	renderSelectors: {
		closeEl: '.header .titlebar .close',
		cancelEl: '.footer a.cancel',
		confirmEl: '.footer a.confirm'
	},

	componentLayout: 'auto',
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
	},


	onAdd: function(cmp){
		var ordinal = cmp.ordinal,
			confirmLabel = cmp.confirmLabel || 'Purchase';

		if(this.rendered){
			this.syncTab(ordinal);
			this.confirmEl.update(confirmLabel);
		}
	},


	syncTab: function(ordinal){
		var tabs = this.getEl().select('.titlebar .tab');
		tabs.removeCls('active');
		tabs.item(ordinal || 0).addCls('active');

	},


	onConfirm: function(){
		if(this.confirmEl.hasCls('disabled')){
			return;
		}

		console.debug('Confirmed!');
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
