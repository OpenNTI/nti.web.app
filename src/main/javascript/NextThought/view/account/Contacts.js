Ext.define('NextThought.view.account.Contacts',{
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-view',
	requires: [
		'NextThought.view.account.contacts.management.Panel',
		'NextThought.view.account.contacts.Card',
		'NextThought.view.account.contacts.Panel'
	],
	tooltip: 'Contacts',
	iconCls: 'contacts',
	ui: 'contacts',
	cls: 'contacts-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'Contacts',cn:[{cls: 'manage'}]}},
		{
			xtype: 'container',
			flex: 1,
			layout: 'card',
			defaults :{
				autoScroll: true,
				overflowX: 'hidden',
				xtype: 'container',
				defaults: {
					layout: 'anchor',
					anchor: '100%',
					xtype: 'contacts-panel'
				}
			},
			items: [
				{ id: 'my-groups' },
				{
					id: 'manage-contacts',
					xtype: 'contacts-management-panel'
//					iconCls: 'manage-groups'
				},
				{html: '-- wording for hidden contacts feature here --'}
			]
		}
	],


	initComponent: function(){
		this.callParent(arguments);
		if(!$AppConfig.service.canShare()){
			this.down('box[cls=view-title]').autoEl = null;
			this.down('container').getLayout().setActiveItem(2);
		}
	},


	afterRender: function(){
		this.callParent(arguments);
		var el = this.el.down('.view-title .manage');
		this.manageBtn = el;
		this.activeView = 0;
		if(el){
			this.mon(el,'click',this.toggleManagement,this);
		}
	},


	toggleManagement: function(){
		this.activeView = (this.activeView+1)%2;
		this.down('container').getLayout().setActiveItem(this.activeView);
		this.manageBtn[this.activeView?'addCls':'removeCls']('active');
	}
});
