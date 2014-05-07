Ext.define('NextThought.view.account.notifications.types.ForumComment', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-forum-comment',

	keyVal: 'application/vnd.nextthought.forums.generalforumcomment',

	itemCls: 'comment',
	showCreator: true,
	previewField: 'bodyPreview',
	quotePreview: false,
	verb: 'commented.',

	fillInData: function(rec) {
		this.callParent(arguments);

		if (!Ext.isEmpty(rec.get('bodyPreview'))) {
			return;
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
