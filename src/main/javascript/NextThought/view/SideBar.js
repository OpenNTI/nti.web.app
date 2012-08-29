Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.SideBarTabPanel',
		'NextThought.view.account.Account',
		'NextThought.view.account.Activity',
		'NextThought.view.account.Identity',
		'NextThought.view.account.Contacts'
	],

	width: 260,
	layout: {
		type:'vbox',
		align: 'stretch'
	},
	floating: true,
	autoShow: true,
	constrain: true,
	frame: false,
	plain: true,
	shadow: false,
	ui: 'sidebar',
	cls: 'sidebar',


	items: [
		{ xtype: 'box', cls: 'gripper', autoEl: { html: '&nbsp;' } },
		{ xtype: 'identity'},
		{ xtype: 'sidebar-tabpanel',
			flex: 1,
			items: [
				{xtype: 'contacts-view'},
				{xtype: 'activity-view', id: 'activity-stream'},
				{iconCls: 'history'},
				{xtype: 'account-view'}
			]}
	],


	initComponent: function(){
		this.callParent(arguments);
		this.gripper = this.down('[cls=gripper]');
		this.mon(this.host,'afterlayout', this.syncUp, this);
		Ext.EventManager.onWindowResize(this.viewportMonitor,this,null);

		this.on('activate',function(){
			Ext.WindowManager.sendToBack(this);
		},this);
	},


	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		this.toggle.remove();
	},


	viewportMonitor: function(w){
		var cls = 'undocked';
		if (w < 1278) {
			this.host.hide();
			this.gripper.show();
			this.addCls(cls);
		}
		else{
			this.gripper.hide();
			this.host.show();
			this.removeCls(cls);
		}
		this.syncUp();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.viewportMonitor(Ext.Element.getViewportWidth());
	},


	syncUp: function(){

		var x = Ext.Element.getViewportWidth()-this.getWidth(),
			y = 0,
			size = this.host.getSize();

		if(!this.host.isVisible()){
			size = {height: Ext.Element.getViewportHeight()-100};
			y = 101;
			x -= 100;
		}

		this.setHeight(size.height);
		this.setPagePosition(x,y);
	}

});
