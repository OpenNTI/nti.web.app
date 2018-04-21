const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.notifications.components.types.ForumComment', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-forum-comment',

	statics: {
		mimeType: [
			'application/vnd.nextthought.forums.generalforumcomment',
			'application/vnd.nextthought.forums.contentforumcomment'
		]
	},

	itemCls: 'comment',
	showCreator: true,
	wording: 'commented on a discussion'
});
