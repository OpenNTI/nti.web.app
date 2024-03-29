const Ext = require('@nti/extjs');
const { getString } = require('internal/legacy/util/Localization');

require('internal/legacy/common/window/Window');
require('internal/legacy/app/account/Header');

require('./Main');

module.exports = exports = Ext.define(
	'NextThought.app.contacts.components.list.Window',
	{
		extend: 'NextThought.common.window.Window',
		alias: 'widget.createlist-window',
		cls: 'createlist-window',
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
			align: 'stretch',
		},

		items: [
			{
				xtype: 'container',
				layout: { type: 'absolute' },
				items: [
					{
						anchor: '100% 100%',
						xtype: 'account-header-view',
						noIcon: true,
						title: getString(
							'NextThought.view.account.contacts.createlist.Window.title'
						),
						detail: getString(
							'NextThought.view.account.contacts.createlist.Window.detail'
						),
					},
					{ xtype: 'box', cls: 'close', width: 10, height: 10 },
				],
			},
			{ xtype: 'createlist-main-view' },
		],

		afterRender: function () {
			this.callParent(arguments);
			this.mon(this.el.down('.close'), 'click', this.close, this);
			this.el.down('input').focus(200);
			if (Ext.is.iPad) {
				this.mon(this.el.down('input'), {
					blur: function () {
						window.scrollTo(0, 0);
					},
				});
			}
		},

		getListName: function () {
			return this.query('createlist-main-view')[0].getListName();
		},

		showError: function (errorText) {
			return this.query('createlist-main-view')[0].showError(errorText);
		},
	}
);
