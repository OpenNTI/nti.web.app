Ext.define('NextThought.app.notifications.components.types.BlogEntryPost', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-blog-entry-post',

	statis: {
		keyVal: 'application/vnd.nextthought.forums.personalblogentrypost'
	},

	itemCls: 'post',
	wording: 'shared a thought'
});
