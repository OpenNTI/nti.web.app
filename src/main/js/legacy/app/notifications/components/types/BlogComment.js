const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.notifications.components.types.BlogComment', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-forum-comment',

	statics: {
		mimeType: 'application/vnd.nextthought.forums.personalblogcomment'
	},

	itemCls: 'comment',
	showCreator: true,
	wording: 'commented on a thought'
});
