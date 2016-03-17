export default Ext.define('NextThought.app.contacts.components.group.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.codecreation-window',

	requires: [
		'NextThought.app.account.Header',
		'NextThought.app.contacts.components.group.Main'
	],

	cls: 'codecreation-window',
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
				title: getString('NextThought.view.account.codecreation.Window.title'),
				detail: getString('NextThought.view.account.codecreation.Window.detail')
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},

		{xtype: 'codecreation-main-view'}
	],

	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.el.down('.close'), 'click', this.close, this);
		this.el.down('input').focus(200);
		if (Ext.is.iPad) {
			this.mon(this.el.down('input'), {
				blur: function() {
					window.scrollTo(0, 0);
				}
			});
		}
	},

	showCreatedGroupCode: function(code) {
		var headerView = this.query('account-header-view')[0];
		headerView.updateHeaderText(
			getString('NextThought.view.account.codecreation.Window.created-title'),
			getString('NextThought.view.account.codecreation.Window.created-detail')
		);
		this.query('codecreation-main-view')[0].setGroupCode(code);
		this.doLayout();
	},

	getGroupName: function() {
		return this.query('codecreation-main-view')[0].getGroupName();
	},

	showError: function(errorText) {
		return this.query('codecreation-main-view')[0].showError(errorText);
	}
});

