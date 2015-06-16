Ext.define('NextThought.app.account.contact.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.contact-us-window',

	requires: [
		'NextThought.app.account.Header',
		'NextThought.app.account.contact.Main'
	],

	cls: 'contact-us-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: true,
	resizable: false,
	dialog: true,
	closeAction: 'destroy',

	role: 'contact',

	width: 480,

	layout: 'none',

	items: [
		{
			xtype: 'account-header-view',
			noIcon: true,
			title: getString('contact_us_title'),
			detail: getString('contact_us_message')
		},
		{xtype: 'contact-main-view'}
	],

	constructor: function(args) {
		var header = this.items.first();

		if (args.titleKey) {
			header.title = getString(args.titleKey);
		}
		if (args.detailKey) {
			header.detail = getString(args.detailKey);
		}

		this.callParent(arguments);
	},


	initComponent: function() {
		this.callParent(arguments);

		var main = this.down('contact-main-view');

		main.handleSubmit = this.handleSubmit.bind(this);
	}
});
