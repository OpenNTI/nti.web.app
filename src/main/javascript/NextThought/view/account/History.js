//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.History',{
	extend: 'Ext.container.Container',
	alias: 'widget.history-view',
	requires: [
		'NextThought.view.SecondaryTabPanel'
	],
	tooltip: 'History',
	iconCls: 'history',
	ui: 'history',
	cls: 'history-view',
	plain: true,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'box', cls: 'view-title', autoEl: {html: 'My History'}},
		{
			xtype: 'container',
			layout: 'fit',
			flex: 1,
			id: 'history-view-panel',

			items: [
				{
					xtype: 'secondary-tabpanel',
					defaults: {defaults: {xtype: 'contacts-panel'}},
					items: [
						{ title: 'Notes' },
						{ title: 'Bookmarks' },
						{ title: 'Chats' }
					]
				}
			]
		}
	]

});
