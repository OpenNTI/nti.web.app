Ext.define('NextThought.app.notifications.components.types.BlogEntry', {
	extend: 'NextThought.app.notifications.components.types.ForumTopic',
	alias: 'widget.notifications-item-blog-entry',

	statics: {
		keyVal: 'application/vnd.nextthought.forums.personalblogentry'
	},

	wording: 'created a thought {title}'
});

// Ext.define('NextThought.app.notifications.components.types.BlogEntry', {
// 	extend: 'NextThought.app.notifications.components.types.ForumTopic',
// 	alias: 'widget.notification-item-blog-entry',

// 	keyVal: 'application/vnd.nextthought.forums.personalblogentry',

// 	wording: getString('NextThought.view.account.notifications.types.BlogEntry.wording', '{creator} created a thought: {title}'),

// 	clicked: function(view, rec) {
// 		var u = rec.get('Creator'),
// 			postId = rec.get('ID');
// 		view.fireEvent('navigate-to-blog', u, postId);
// 	}
// });
