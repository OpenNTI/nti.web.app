Ext.define('NextThought.view.account.history.mixins.BlogEntryPost', {
	alias: 'widget.history-item-blog-entry-post',
	extend: 'NextThought.view.account.history.mixins.Base',

	keyVal: 'application/vnd.nextthought.forums.personalblogentrypost',

	showCreator: true,
	verb: 'shared a thought',
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
