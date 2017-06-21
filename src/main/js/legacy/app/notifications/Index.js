const Ext = require('extjs');

const NavigationActions = require('../navigation/Actions');

const NotificationsStateStore = require('./StateStore');

require('../../mixins/Router');
require('./components/Stream');


module.exports = exports = Ext.define('NextThought.app.notifications.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-index',
	cls: 'notifications-index',
	layout: 'none',
	fullwidth: true,

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.NavActions = NavigationActions.create();
		this.NotableStore = NotificationsStateStore.getInstance();

		this.addRoute('/', this.showNotifications.bind(this));

		this.addDefaultRoute('/');

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});
	},

	onActivate: function () {
		if (this.stream) {
			this.stream.onActivate();
		}

		this.isActive = true;
	},

	onDeactivate: function () {
		if (this.stream) {
			this.stream.onDeactivate();
		}

		this.isActive = false;
	},

	showNotifications: function () {
		var me = this;

		me.NavActions.setActiveContent(null);
		me.NavActions.updateNavBar({
			hideBranding: true
		});

		me.setTitle('Notifications');

		if (!me.stream) {
			return me.buildStream();
		}

		return Promise.resolve();
	},

	buildStream: function () {
		this.stream = this.add({
			xtype: 'notifications-stream-list'
		});

		this.addChildRouter(this.stream);

		if (this.isActive) {
			this.stream.onActivate();
		}
	}
});
