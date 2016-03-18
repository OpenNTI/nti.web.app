var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.app.notifications.components.Header', {
	extend: 'Ext.Component',
	alias: 'widget.notification-header',

	cls: 'notification-header',

	renderTpl: Ext.DomHelper.markup(
		{tag: 'h3', html: 'Notifications'}
	)
});
