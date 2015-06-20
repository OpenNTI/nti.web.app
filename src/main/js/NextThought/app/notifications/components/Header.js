Ext.define('NextThought.app.notifications.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.notification-header',

	cls: 'natification-header',

	renderTpl: Ext.DomHelper.markup(
		{tag: 'h3', html: 'Notifications'}
	)
});
