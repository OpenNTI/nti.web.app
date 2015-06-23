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

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});
	},


	onActivate: function() {
		if (this.stream) {
			this.stream.onActivate();
		}

		this.isActive = true;
	},


	onDeactivate: function() {
		if (this.stream) {
			this.stream.onDeactivate();
		}

		this.isActive = false;
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


	showLoading: function() {
		if (!this.loadingCmp) {
			this.loadingCmp = this.add({
				xtype: 'box',
				autoEl: {cls: 'loading-container item', cn: {cls: 'loading', html: 'Loading...'}}
			});
		}
	},


	removeLoading: function() {
		if (this.loadingCmp) {
			this.remove(this.loadingCmp, true);
			delete this.loadingCmp;
		}
	},


	buildStream: function() {
		this.stream = this.add({
			xtype: 'notifications-stream-list',
			addMask: this.showLoading.bind(this),
			removeMask: this.removeLoading.bind(this)
		});

		if (this.isActive) {
			this.stream.onActivate();
		}
	}
});
