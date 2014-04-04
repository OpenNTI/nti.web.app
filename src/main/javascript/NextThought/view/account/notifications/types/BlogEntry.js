Ext.define('NextThought.view.account.notifications.types.BlogEntry', {
	extend: 'NextThought.view.account.notifications.types.ForumTopic',
	alias: 'widget.notification-item-blog-entry',

	keyVal: 'application/vnd.nextthought.forums.personalblogentry',

	clicked: function(view, rec) {
		var u = rec.user,
			postId = rec.get('ID');
		view.fireEvent('navigate-to-blog', u, postId);
	}
});
