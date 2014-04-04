Ext.define('NextThought.view.account.notifications.types.ForumTopic', {
	extend: 'NextThought.view.account.notifications.types.Note',
	alias: 'widget.notification-item-forum-topic',

	keyVal: 'application/vnd.nextthought.forums.communityheadlinetopic',


	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'item post',
			cn: [
				{cls: 'title', html: '{title} by:'},
				{cls: 'author', html: '{creatorName}'},
				{tag: 'tpl', 'if': 'tags.length &gt; 0', cn: [
					{cls: 'tags', html: 'Tags: {tags}'}]}
			]
		}
	])),

	fillInData: function(rec) {
		var u = rec.get('Creator');
		if (isMe(u)) {
			rec.set({'creatorName': 'Me'});
			rec.user = $AppConfig.userObject;
		}
		else {
			UserRepository.getUser(u).then(function(user) {
				rec.set({'creatorName': user.getName()});
				rec.user = user;
			});
		}
	},

	clicked: function(view, rec) {
		view.fireEvent('show-topic', view, rec);
	}
});
