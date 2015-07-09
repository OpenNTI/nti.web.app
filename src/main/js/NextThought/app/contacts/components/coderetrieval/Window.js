Ext.define('NextThought.app.contacts.components.coderetrieval.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.coderetrieval-window',

	requires: [
		'NextThought.app.account.Header',
		'NextThought.app.contacts.components.coderetrieval.Main'
	],

	cls: 'coderetrieval-window',
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
				title: '',
				detail: getString('NextThought.view.account.coderetrieval.Window.detail')
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},

		{xtype: 'coderetrieval-main-view'}
	],

	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.el.down('.close'), 'click', this.close, this);
		this.down('account-header-view').updateTitle(this.groupName);
		this.down('coderetrieval-main-view').updateCode(this.code);
	}
});

