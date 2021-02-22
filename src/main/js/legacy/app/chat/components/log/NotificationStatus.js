const Ext = require('@nti/extjs');

require('./NotificationEntry');

module.exports = exports = Ext.define(
	'NextThought.app.chat.components.log.NotificationStatus',
	{
		extend: 'NextThought.app.chat.components.log.NotificationEntry',
		alias: 'widget.chat-notification-status',
	}
);
