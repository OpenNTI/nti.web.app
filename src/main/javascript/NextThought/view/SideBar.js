Ext.define('NextThought.view.SideBar',{
	extend: 'Ext.container.Container',
	alias: 'widget.main-sidebar',

	requires: [
		'NextThought.view.account.MyAccount',
		'NextThought.view.account.MyContacts'
	],

	width: 275,
	layout: 'vbox',
	floating: false,
	autoShow: true,
	shadow: false,
	cls: 'main-sidebar',

	items: [
		{xtype: 'my-account'},
		{xtype: 'my-contacts', flex:1}
	],

	toggleTpl: Ext.DomHelper.createTemplate({cls: 'sidebar-toggle'}).compile(),


	initComponent: function(){
		this.callParent(arguments);
		this.toggle = this.toggleTpl.append(Ext.getBody(), [], true).hide();
		this.mon(this.toggle, {
			scope: this,
			'click': this.toggleFlyover
		});
		Ext.EventManager.onWindowResize(this.viewportMonitor,this);
	},


	destroy: function(){
		Ext.EventManager.removeResizeListener(this.viewportMonitor,this);
		this.toggle.remove();
	},


	viewportMonitor: function(w){
		if (this.floating) {
			this.hide();
		}

		if (w < 1300) {
			if (!this.floating) {
				//this.hide();
				this.collapse();
				this.toggle.show();
			}
		}
		else if(this.floating){
			this.expand();
			this.toggle.hide();
		}
	},


	collapse: function(){
		if (!this.floating){
			this.myOwner.items.remove(this);
			this.myOwner.floatingItems.add(this);
			this.hide();
			this.floating = true;
			this.hidden = true;
			this.wrapPrimaryEl(this.el.dom);
		}
	},


	expand: function(){
		this.myOwner.items.add(this);
		this.myOwner.floatingItems.remove(this);

		this.floating = false;
		this.el.removeCls('x-layer');
		this.show();
	},


	toggleFlyover: function(){
		var visible = this.isVisible(),
			h = Ext.Element.getViewportHeight(),
			w = Ext.Element.getViewportWidth();
		if (visible) {
			this.hide();
			return;
		}
		this.setHeight(h);
		this.showAt(w-this.width, 0);
		this.doLayout();
	},


	toFront: function(){
		this.callParent(arguments);
		this.toggle.setStyle({zIndex: this.el.zindex+1});
	},


	onAdded: function(o){
		this.myOwner = o;
		o.floatingItems = o.floatingItems || new Ext.util.MixedCollection();
		return this.callParent(arguments);
	},


	afterRender: function(){
		this.callParent(arguments);
		this.viewportMonitor(Ext.Element.getViewportWidth());
	}

});
