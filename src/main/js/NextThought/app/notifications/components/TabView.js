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


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		Ext.EventManager.onWindowResize(me.setMaxHeight, me);

		me.on('destroy', function() {
			Ext.EventManager.removeResizeListener(me.setMaxHeight, me);
		});

		me.setMaxHeight();
	},


	setMaxHeight: function() {
		if (!this.rendered) {
			this.on('afterrender', this.setMaxHeight.bind(this));
			return;
		}

		var winHeight = Ext.Element.getViewportHeight(),
			el = this.el,
			maxHeight = winHeight - 85 - 20 - 32;//the top of the list is set at 85 and allow some room on the bottom

		el = el.down('.notifications.user-data-panel');

		if (el) {
			el.setStyle({
				maxHeight: maxHeight + 'px'
			});
		}
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
