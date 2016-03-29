var Ext = require('extjs');
var WindowWindow = require('../../../../../common/window/Window');
var EmailverifyMain = require('./Main');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.emailverify.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.email-token-window',
	cls: 'email-verification-window',
	ui: 'nt-window',
	minimizable: false,
	constrain: true,
	constrainTo: Ext.getBody(),
	floating: true,
	closable: true,
	resizable: false,
	width: 450,
	dialog: true,
	closeAction: 'destroy',
	layout: 'none',

	items: [
		{xtype: 'email-verify-view'}
	],

	initComponent: function () {
		this.callParent(arguments);
		this.view = this.down('email-verify-view');
		this.view.user = this.user;
	},

	presentPendingVerification: function (seconds) {
		return this.view.presentPendingVerification(seconds);
	}
});
