Ext.define('NextThought.view.store.purchase.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.purchase-window',

	cls:'purchase-window',
	width: 695,
	height: 640,
	layout: 'fit',
	modal: true,
	header: true,
	dockedItems:{
		xtype: 'container',
		dock:'bottom',
		ui: 'footer',
		height:55,
		baseCls: 'nti-window',
		layout: {
			type: 'hbox',
			align: 'stretchmax'
		},
		defaults:{
			cls: 'footer-region',
			xtype: 'container',
			flex: 1,
			layout: 'hbox'
		},
		items:[{
			layout: {type:'hbox', pack:'end'},
			defaults: { xtype:'button', ui:'blue', scale:'large'},
			items:[
				{text: 'Cancel',  action: 'cancel', ui: 'secondary' },
				{text: 'Redeem Code', cls:'.x-btn-blue-large', action: 'redeem'},
				{text: 'Buy!', cls:'.x-btn-blue-large', action: 'buy'}
			]
		}]
	},

	initComponent: function(){
		this.callParent(arguments);
		this.on('show', this.addCustomMask, this);
		this.on('close', this.removeCustomMask, this);
	},

	addCustomMask: function(){
		var mask = this.zIndexManager.mask;
		mask.addCls('nti-black-clear');
	},

	removeCustomMask: function(){
		var mask = this.zIndexManager.mask;
		if(mask){
			mask.removeCls('nti-black-clear');
		}
	}
});
