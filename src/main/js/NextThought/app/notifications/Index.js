Ext.define('NextThought.app.notifications.Index', {
	extend: 'Ext.Component',
	alias: 'widget.notifications',

	requires: [
		'NextThought.app.notifications.components.List'
	],

	cls: 'notifications-icon',

	initComponent: function() {
		this.callParent(arguments);

		this.listComponent = Ext.widget({xtype: 'notifications-panel', ownerCt: this, updateBadge: this.updateBadge.bind(this)});

		this.on('destroy', 'destroy', this.listComponent);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, {
			click: this.toggleMenu.bind(this),
			mouseout: this.startToHideMenu.bind(this)
		});


		this.mon(this.listComponent, {
			mouseenter: this.cancelHide.bind(this),
			show: this.addCls.bind(this, 'menu-showing'),
			hide: this.removeCls.bind(this, 'menu-showing')
		});
	},


	updateBadge: function(badge) {},


	toggleMenu: function() {},


	startToHideMenu: function() {},


	cancelHide: function() {}
});