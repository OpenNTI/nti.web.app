Ext.define('NextThought.view.account.contact.Window', {
	extend: 'NextThought.view.window.Window',
	alias:  'widget.contact-us-window',

	requires: [
		'NextThought.view.account.Header',
		'NextThought.view.account.contact.Main'
	],

	cls:         'contact-us-window',
	ui:          'nt-window',
	minimizable: false,
	constrain:   true,
	modal:       true,
	closable:    true,
	resizable:   false,
	dialog:      true,
	closeAction: 'destroy',

	role: 'contact',

	width: 480,

	layout: {
		type:  'vbox',
		align: 'stretch'
	},

	items: [
		{
			xtype:  'account-header-view',
			noIcon: true,
			title:  getString('contact_us_title'),
			detail: getString('contact_us_message')
		},
		{xtype: 'contact-main-view'}
	],

	constructor: function (args) {
		var header = this.items.first();
		if (args.titleKey) {
			header.title = getString(args.titleKey);
		}
		if (args.detailKey) {
			header.detail = getString(args.detailKey);
		}
		this.callParent(arguments);
	}
});
