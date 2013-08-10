Ext.define('NextThought.view.forums.forumcreation.Window',{
	extend: 'NextThought.view.window.Window',
	alias: 'widget.forumcreation-window',

	requires: [
		'NextThought.view.account.Header',
		'NextThought.view.forums.forumcreation.Main'
	],

	cls: 'forumcreation-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: true,
	resizable: false,
	dialog: true,
	closeAction: 'destroy',

	width: 480,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	config: {
		url: ''
	},

	items: [
		{
			xtype: 'account-header-view',
			noIcon: true,
			title: 'Create Forum',
			detail: 'To create a new forum fill out the information below.  We\'ll create a new forum for you with the provided title and description'
		},
		{xtype: 'forumcreation-main-view'}
	]
});
