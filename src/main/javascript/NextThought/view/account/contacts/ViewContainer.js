Ext.define('NextThought.view.account.contacts.ViewContainer',{
	extend: 'Ext.panel.Panel',
	alias: 'widget.contacts-tab-view-container',
	requires: [
		'NextThought.view.account.contacts.View',
		'NextThought.view.chat.Dock'
	],

	title: 'Chat',
	tabConfig: {
		tooltip: 'Chat'
	},

	iconCls: 'contacts',
	ui: 'contacts',

	layout: 'border',
	items: [
		{ xtype: 'contacts-view', region: 'center' },
		{ xtype: 'chat-dock', region: 'south', collapsed: true}
	]

});
