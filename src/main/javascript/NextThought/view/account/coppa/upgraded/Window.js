Ext.define('NextThought.view.account.coppa.upgraded.Window', {
	extend: 'NextThought.view.Window',
	alias: 'widget.coppa-confirm-window',

	requires:[
		'NextThought.view.account.coppa.upgraded.Confirm',
		'NextThought.view.account.Header'
	],

	cls: 'coppa-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: false,
	resizable: false,
	dialog: true,

	width: 480,

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	items: [
		{xtype: 'account-header-view', title:'Children\'s Privacy Changed!', detail:'Please fill the following information before you proceed'},
		{xtype: 'coppa-birthday-form'}
	]

});