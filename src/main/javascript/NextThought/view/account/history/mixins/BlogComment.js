Ext.define('NextThought.view.account.history.mixins.BlogComment', {
	extend: 'NextThought.view.account.history.mixins.ForumComment',
	alias: 'widget.history-item-blog-comment',

	keyVal: 'application/vnd.nextthought.forums.personalblogcomment',

	clicked: function(view, rec) {
		alert('TODO: go to blog comment');
	}
});
