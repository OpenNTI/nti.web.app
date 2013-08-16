Ext.define('NextThought.view.account.code.Window', {
	extend: 'NextThought.view.window.Window',
	alias: 'widget.code-window',

	requires: [
		'NextThought.view.account.Header',
		'NextThought.view.account.code.Main'
	],

	cls: 'code-window',
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

	items: [
		{xtype: 'container', layout: {type: 'absolute'}, items: [
			{
				anchor: '100% 100%',
				xtype: 'account-header-view',
				noIcon: true,
				title: 'Enter a Group Code...',
				detail: 'Please enter your code to join a specific group or class.'
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},
		{xtype: 'code-main-view'}
	],

	afterRender: function () {
		this.callParent(arguments);
		this.mon(this.el.down('.close'), 'click', this.close, this);
		this.el.down('input').focus(200);
		if (Ext.is.iPad) {
			this.mon(this.el.down('input'), {
				blur: function () {
					window.scrollTo(0, 0);
				}
			});
		}
	}
});
