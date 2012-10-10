//Styles defined in _history-view.scss
Ext.define('NextThought.view.account.history.View',{
	extend: 'Ext.container.Container',
	alias: 'widget.history-view',
	requires: [
		'NextThought.view.SecondaryTabPanel',
		'NextThought.view.UserDataPanel'
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
					defaults: {xtype:'user-data-panel'},
					items: [
						{ title: 'Notes', mimeType: 'application/vnd.nextthought.note,application/vnd.nextthought.highlight' },
						{ title: 'Bookmarks',mimeType: 'application/vnd.nextthought.favorite' },
						{ title: 'Chats',mimeType: 'application/vnd.nextthought.transcript' }
					]
				}
			]
		}
	]

});
