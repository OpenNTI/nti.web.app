Ext.define('NextThought.view.account.notifications.types.BlogComment', {
	extend: 'NextThought.view.account.notifications.types.ForumComment',
	alias: 'widget.notification-item-blog-comment',

	keyVal: 'application/vnd.nextthought.forums.personalblogcomment',

	clicked: function(view, rec) {
		function success(r) {
			UserRepository.getUser(r.get('Creator'))
					.then(function(user) {
						view.fireEvent('navigate-to-blog', user, r.get('ID'), rec.get('ID'));
					});
		}

		Service.getObject(rec.get('ContainerId'), success, function() {
			console.log('Can`t find blog entry to navigate to', arguments);
		});
	}
});
