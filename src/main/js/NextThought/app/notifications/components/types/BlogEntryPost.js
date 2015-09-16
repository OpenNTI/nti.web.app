Ext.define('NextThought.app.notifications.components.types.BlogEntryPost', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-blog-entry-post',

	statis: {
		keyVal: 'application/vnd.nextthought.forums.personalblogentrypost'
	},

	itemCls: 'post',
	wording: 'shared a thought'
});

// Ext.define('NextThought.app.notifications.components.types.BlogEntryPost', {
// 	extend: 'NextThought.app.notifications.components.types.Base',
// 	alias: 'widget.notification-item-blog-entry-post',

// 	keyVal: 'application/vnd.nextthought.forums.personalblogentrypost',

// 	showCreator: true,
// 	wording: 'NextThought.view.account.notifications.types.BlogEntryPost.wording',
// 	previewField: 'title',
// 	quotePreview: false,
// 	itemCls: 'post',

// 	clicked: function(view, rec) {
// 		var u = rec.get('Creator'),
// 			postId = rec.get('ContainerId');

// 		//TODO: figure out this navigation
// 	}
// });
