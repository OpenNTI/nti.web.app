Ext.define('NextThought.app.profiles.user.components.emailverify.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.email-token-window',

	requires: [
		'NextThought.app.profiles.user.components.emailverify.Main'
	],

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

	presentPendingVerification: function (seconds) {
		var active = this.down('email-verify-view');

		if (active && active.presentPendingVerification) {
			active.presentPendingVerification(seconds);
		}
	}
});
