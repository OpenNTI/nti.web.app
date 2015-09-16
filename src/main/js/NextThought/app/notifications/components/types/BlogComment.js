Ext.define('NextThought.app.notifications.components.types.BlogComment', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-forum-comment',

	statics: {
		keyVal: 'application/vnd.nextthought.forums.personalblogcomment'
	},

	itemCls: 'comment',
	showCreator: true,
	wording: 'commented on a thought'
});

// Ext.define('NextThought.app.notifications.components.types.BlogComment', {
// 	extend: 'NextThought.app.notifications.components.types.ForumComment',
// 	alias: 'widget.notification-item-blog-comment',

// 	keyVal: 'application/vnd.nextthought.forums.personalblogcomment',
// 	wording: 'NextThought.view.account.notifications.types.BlogComment.wording',

// 	clicked: function(view, rec) {
// 		function success(r) {
// 			UserRepository.getUser(r.get('Creator'))
// 					.then(function(user) {
// 						view.fireEvent('navigate-to-blog', user, r.get('ID'), rec.get('ID'));
// 					});
// 		}

// 		Service.getObject(rec.get('ContainerId'), success, function() {
// 			console.log('Can`t find blog entry to navigate to', arguments);
// 		});
// 	}
// });
