var Ext = require('extjs');
var WindowWindow = require('../../../../common/window/Window');
var AccountHeader = require('../../../account/Header');
var CodeMain = require('./Main');


module.exports = exports = Ext.define('NextThought.app.contacts.components.code.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.code-window',
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
				title: getString('NextThought.view.account.code.Window.title'),
				detail: getString('NextThought.view.account.code.Window.detail')
			},
			{xtype: 'box', cls: 'close', width: 10, height: 10}
		]},
		{xtype: 'code-main-view'}
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
	}
});
