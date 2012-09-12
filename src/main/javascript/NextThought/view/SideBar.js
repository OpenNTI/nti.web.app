Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.SideBarTabPanel',
		'NextThought.view.account.View',
		'NextThought.view.account.activity.View',
		'NextThought.view.account.contacts.View',
		'NextThought.view.account.history.View',
		'NextThought.view.account.Identity'
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
		{ xtype: 'box', cls: 'gripper', autoEl: { html: '&nbsp;', cn:[
			{tag: 'img', src:Ext.BLANK_IMAGE_URL,cls:'tool minimize' }]}},
		{ xtype: 'identity'},
		{ xtype: 'sidebar-tabpanel',
			flex: 1,
			items: [
				{xtype: 'contacts-view'},
				{xtype: 'activity-view', id: 'activity-stream'},
				{xtype: 'history-view', hidden: true},
				{xtype: 'account-view', hidden: true}
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
			delete this.popstate;
			this.gripper.hide();
			this.host.show();
			this.removeCls(cls);
		}
		this.syncUp();
	},


	afterRender: function(){
		this.callParent(arguments);
		this.viewportMonitor(Ext.Element.getViewportWidth());
		this.mon(this.gripper.el,'click',this.togglePopup,this);
	},


	syncUp: function(){

		var h = Ext.Element.getViewportHeight(),
			x = Ext.Element.getViewportWidth()-this.getWidth(),
			y = 0,
			size = this.host.getSize(),
			animate = false,
			up = 100,
			down = h - this.gripper.getHeight();

		if(!this.host.isVisible()){
			animate = true;
			size = {height: h-100};
			y = (this.popstate? up:down)+1;
			x -= 10;
		}

		this.setHeight(size.height);
		this.fireEvent('beforemove',animate);
		this.setPagePosition(x,y,animate);
	},


	togglePopup: function(){
		this.popstate = !this.popstate;
		this.syncUp();
	}

});
