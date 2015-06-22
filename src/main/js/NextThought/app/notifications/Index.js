Ext.define('NextThought.app.notifications.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-index',

	cls: 'notifications-index',

	requires: [
		'NextThought.app.navigation.Actions',
		'NextThought.app.notifications.StateStore',
		'NextThought.app.notifications.components.Header',
		'NextThought.app.stream.List',
		'NextThought.app.stream.util.StreamSource'
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

		if (!me.stream) {
			return me.buildStream();
		}

		return Promise.resolve();
	},


	buildStream: function() {
		var me = this;

		return Promise.all([
				me.NotableStore.getURL(),
				me.NotableStore.getLastViewed()
			]).then(function(results) {
				var url = results[0],
					lastViewed = results[1];

				me.setTitle('Notifications');
				me.StreamSource = NextThought.app.stream.util.StreamSource.create({
					url: url
				});

				me.stream = me.add({
					xtype: 'stream-list',
					StreamSource: me.StreamSource
				});
			});
	}
});
