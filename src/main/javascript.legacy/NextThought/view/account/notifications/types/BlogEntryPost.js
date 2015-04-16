Ext.define('NextThought.view.account.notifications.types.BlogEntryPost', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-blog-entry-post',

	keyVal: 'application/vnd.nextthought.forums.personalblogentrypost',

	showCreator: true,
	wording: 'NextThought.view.account.notifications.types.BlogEntryPost.wording',
	previewField: 'title',
	quotePreview: false,
	itemCls: 'post',

	clicked: function(view, rec) {
		var u = rec.get('Creator'),
			postId = rec.get('ContainerId');

		Service.getObject(postId, function(post) {
			view.fireEvent('navigate-to-blog', u, post.get('ID'));
		});
	}
});
