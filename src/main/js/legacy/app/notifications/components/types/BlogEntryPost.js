const Ext = require('@nti/extjs');

require('./Base');

module.exports = exports = Ext.define('NextThought.app.notifications.components.types.BlogEntryPost', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-blog-entry-post',

	statis: {
		mimeType: 'application/vnd.nextthought.forums.personalblogentrypost'
	},

	itemCls: 'post',
	wording: 'shared a thought'
});
