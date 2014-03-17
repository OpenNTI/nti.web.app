Ext.define('NextThought.view.account.history.mixins.ForumComment', {
	extend: 'NextThought.view.account.history.mixins.Note',
	alias: 'widget.history-item-forum-comment',

	keyVal: 'application/vnd.nextthought.forums.generalforumcomment',


	tpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{
			cls: 'history comment',
			cn: [
				{tag: 'span', cls: 'link', html: '{Creator:displayName()}'},
				' commented ',
				{tag: 'span', cls: 'body', html: '{bodyPreview}'}
			]
		}
	])),

	fillInData: function(rec) {
		var u = rec.get('Creator');

		//get the creator
		if (isMe(u)) {
			rec.set({'Creator': $AppConfig.userObject});
		}
		else {
			UserRepository.getUser(u, function(user) {
				rec.set({'Creator': user});
			});
		}

		//get the preview
		if (rec.getActivityItemConfig) {
			rec.getActivityItemConfig()
				.done(function(config) {
					rec.set('bodyPreview', config.message);
				});
		}
	},

	clicked: function(view, rec) {
		view.fireEvent('show-topic-comment', view, rec);
	}
});
