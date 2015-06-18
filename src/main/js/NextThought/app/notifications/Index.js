Ext.define('NextThought.app.notifications.Index', {
	extend: 'Ext.Component',
	alias: 'widget.notifications',

	requires: [
		'NextThought.app.notifications.components.View'
	],

	cls: 'notifications-icon',

	initComponent: function() {
		this.callParent(arguments);

		this.list = Ext.widget({
			xtype: 'notifications-view',
			ownerCt: this,
			updateBadge: this.updateBadge.bind(this),
			close: this.setMenuClosed.bind(this)
		});

		this.on('destroy', 'destroy', this.listComponent);
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, {
			click: this.toggleMenu.bind(this),
			mouseout: this.startToHideMenu.bind(this)
		});


		this.mon(this.list, {
			mouseenter: this.cancelHide.bind(this),
			show: this.addCls.bind(this, 'menu-showing'),
			hide: this.removeCls.bind(this, 'menu-showing')
		});
	},


	updateBadge: function(badge) {
		if (this.el && this.el.dom) {
			this.el.dom.setAttribute('data-badge', badge || 0);
		}
	},

	onMenuShow: function() {
		this.list.show();
	},


	onMenuHide: function() {
		this.list.hide();
	},


	toggleMenu: function() {
		if (this.list.isVisible()) {
			this.setMenuClosed();
		} else {
			this.setMenuOpen();
		}
	},


	startToHideMenu: function() {},


	cancelHide: function() {}
});