Ext.define('NextThought.app.notifications.components.TabView', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-tab-view',

	floating: true,

	requires: ['NextThought.app.notifications.components.MostRecent'],

	layout: 'none',
	cls: 'notifications-view',


	initComponent: function() {
		this.callParent(arguments);

		this.add([{
			xtype: 'notifications-most-recent',
			updateBadge: this.updateBadge.bind(this)
		}, {
			xtype: 'box',
			cls: 'show-all',
			autoEl: {html: 'Show All'},
			listeners: {
				click: {
					element: 'el',
					fn: this.showAll.bind(this)
				}
			}
		}]);

		this.list = this.down('notifications-most-recent');

		this.onBodyClick = this.onBodyClick.bind(this);

		this.on({
			show: this.addBodyListener.bind(this),
			hide: this.removeBodyListener.bind(this)
		});
	},


	onBodyClick: function(e) {
		if (!e.getTarget('.notifications-icon') && !e.getTarget('.notifications-view')) {
			this.close();
		}
	},


	addBodyListener: function() {
		var me = this;

		Ext.getBody().on('click', this.onBodyClick);
		this.list.onActivate();
	},


	removeBodyListener: function() {
		Ext.getBody().un('click', this.onBodyClick);
	},


	showAll: function() {
		this.pushRootRoute('Notifications', 'notifications');
	}
});
