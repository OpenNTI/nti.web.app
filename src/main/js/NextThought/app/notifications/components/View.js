Ext.define('NextThought.app.notifications.components.View', {
	extend: 'Ext.container.Container',
	alias: 'widget.notifications-view',

	floating: true,

	requires: ['NextThought.app.notifications.components.List'],

	layout: 'none',
	cls: 'notifications-view',


	initComponent: function() {
		this.callParent(arguments);

		this.add([{
			xtype: 'notifications-panel',
			updateBadge: this.updateBadge.bind(this)
		}, {
			xtype: 'box',
			cls: 'show-all',
			autoEl: {html: 'Show All'},
			listeners: {
				click: {
					element: 'el',
					fn: this.pushRootRoute.bind(this, 'Notifications', 'notifications')
				}
			}
		}]);

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
	},


	removeBodyListener: function() {
		Ext.getBody().un('click', this.onBodyClick);
	}
});
