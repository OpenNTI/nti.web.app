export default Ext.define('NextThought.app.profiles.user.components.emailverify.info.Window', {
	extend: 'NextThought.common.window.Window',
	alias: 'widget.email-verify-info-window',

	requires: [
		'NextThought.app.profiles.user.components.emailverify.info.View'
	],

	cls: 'email-verification-window info',
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
		{xtype: 'email-verify-info-view'}
	]
});
