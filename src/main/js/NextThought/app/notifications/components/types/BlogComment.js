export default Ext.define('NextThought.app.notifications.components.types.BlogComment', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-forum-comment',

	statics: {
		keyVal: 'application/vnd.nextthought.forums.personalblogcomment'
	},

	itemCls: 'comment',
	showCreator: true,
	wording: 'commented on a thought'
});
