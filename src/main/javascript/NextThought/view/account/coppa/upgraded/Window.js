Ext.define('NextThought.view.account.coppa.upgraded.Window', {
	extend: 'NextThought.view.window.Window',
	alias:  'widget.coppa-confirm-window',

	requires: [
		'NextThought.view.account.coppa.upgraded.Confirm',
		'NextThought.view.account.Header'
	],

	cls:         'coppa-window',
	ui:          'nt-window',
	minimizable: false,
	constrain:   true,
	modal:       true,
	closable:    false,
	resizable:   false,
	dialog:      true,

	width: 670,

	layout: 'auto',

	items: [
		{xtype: 'account-header-view', title: 'It\'s a new school year!', detail: 'Please answer the following questions, so we can update our records.'},
		{xtype: 'coppa-birthday-form'}
	]

});
