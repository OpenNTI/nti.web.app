Ext.define('NextThought.app.notifications.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-index',

	cls: 'notifications-index',

	layout: 'none',

	requires: [
		'NextThought.app.navigation.Actions',
		'NextThought.app.notifications.StateStore',
		'NextThought.app.notifications.components.Header',
		'NextThought.app.notifications.components.Stream'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	items: [
		{
			xtype: 'notification-header'
		}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.NavActions = NextThought.app.navigation.Actions.create();
		this.NotableStore = NextThought.app.notifications.StateStore.getInstance();

		this.addRoute('/', this.showNotifications.bind(this));

		this.addDefaultRoute('/');
	},


	showNotifications: function() {
		var me = this;

		me.NavActions.setActiveContent(null);
		me.NavActions.updateNavBar(null);
		me.setTitle('Notifications');

		if (!me.stream) {
			return me.buildStream();
		}

		return Promise.resolve();
	},


	buildStream: function() {
		this.stream = this.add({
			xtype: 'notifications-stream-list'
		});
	}
});
