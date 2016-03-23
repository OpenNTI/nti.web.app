var Ext = require('extjs');
var WindowWindow = require('../../../common/window/Window');
var RecoveryEmail = require('./Email');
var AccountHeader = require('../Header');


module.exports = exports = Ext.define('NextThought.app.account.recovery.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.recovery-email-window',
	cls: 'recovery-email-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	modal: true,
	closable: false,
	resizable: false,
	dialog: true,
	width: 480,
	layout: 'none',

	items: [
		{
			xtype: 'account-header-view',
			title: getString('NextThought.view.account.recovery.Window.general-title'),
			detail: getString('NextThought.view.account.recovery.Window.general-detail'),
			icon: 'alert'
		}
	],

	initComponent: function() {
		this.callParent(arguments);
		this.add({
			xtype: 'recovery-email-view',
			fieldName: this.fieldName,
			linkName: this.linkName,
			handleSubmit: this.handleSubmit.bind(this)
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		var headerView = this.down('account-header-view'),
			emailView = this.down('recovery-email-view');

		if (this.linkName === 'state-bounced-contact-email') {
			//is contact email, not cancelable
			Ext.fly(headerView.el.query('.title')[0]).setHTML(getString('NextThought.view.account.recovery.Window.resend-title'));
			Ext.fly(headerView.el.query('.detail')[0]).setHTML(getString('NextThought.view.account.recovery.Window.resend-detail') + ' ' +
															   getString('NextThought.view.account.recovery.Window.need-parents'));
			emailView.down('button[name=cancel]').destroy();
		}
		else if (this.linkName === 'contact-email-sends-consent-request') {
			//is request to resent consent email and enter a new consent email
			Ext.fly(headerView.el.query('.title')[0]).setHTML(getString('NextThought.view.account.recovery.Window.resend-title'));
			Ext.fly(headerView.el.query('.detail')[0]).setHTML(getString('NextThought.view.account.recovery.Window.need-parents'));
		}
		else {
			//regular email, not cancelable
			Ext.fly(headerView.el.query('.title')[0]).setHTML(getString('NextThought.view.account.recovery.Window.invalid-title'));
			Ext.fly(headerView.el.query('.detail')[0]).setHTML(getString('NextThought.view.account.recovery.Window.invalid-detail'));
			emailView.down('button[name=cancel]').destroy();
		}
	}
});
