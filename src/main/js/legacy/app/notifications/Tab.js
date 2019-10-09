const Ext = require('@nti/extjs');

const NotificationsStateStore = require('./StateStore');

require('./components/TabView');


module.exports = exports = Ext.define('NextThought.app.notifications.Tab', {
	extend: 'Ext.Component',
	alias: 'widget.notifications-tab',


	renderTpl: Ext.DomHelper.markup([
		{cls: 'notifications-icon', role: 'button', tabindex: '0', title: 'Notifications'}
	]),

	initComponent: function () {
		this.callParent(arguments);

		this.list = Ext.widget({
			xtype: 'notifications-tab-view',
			ownerCt: this,
			updateBadge: this.updateBadge.bind(this),
			close: this.setMenuClosed.bind(this),
			pushRootRoute: this.pushRootRoute.bind(this),
			navigateToObject: this.doNavigateToObject.bind(this)
		});

		this.NotificationsStore = NotificationsStateStore.getInstance();
		this.mon(this.NotificationsStore, 'update-unseen-count', this.updateBadge.bind(this));

		this.on('destroy', 'destroy', this.listComponent);
	},

	afterRender: function () {
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

	updateBadge: function (badge) {
		if (this.el && this.el.dom) {
			this.el.dom.setAttribute('data-badge', badge || 0);
		}
	},

	onMenuShow: function () {
		this.list.show();
	},

	onMenuHide: function () {
		if (this.list.isVisible()) {
			this.list.hide();
			this.list.onDeactivate();
		}

	},

	toggleMenu: function () {
		if (this.list.isVisible()) {
			this.setMenuClosed();
		} else {
			this.setMenuOpen();
		}
	},

	doNavigateToObject: function (rec) {
		this.toggleMenu();

		this.navigateToObject(rec);
	},

	startToHideMenu: function () {},
	cancelHide: function () {}
});
