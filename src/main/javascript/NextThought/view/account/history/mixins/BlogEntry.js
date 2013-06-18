Ext.define('NextThought.view.account.history.mixins.BlogEntry', {
	alias: 'widget.history-item-blog-entry',
	extend: 'NextThought.view.account.history.mixins.ForumTopic',

	keyVal: "application/vnd.nextthought.forums.personalblogentry",

	clicked: function(view, rec){
		var u = rec.user,
			postId = rec.get('ID');
		view.fireEvent('navigate-to-blog', u, postId);
	}
});
