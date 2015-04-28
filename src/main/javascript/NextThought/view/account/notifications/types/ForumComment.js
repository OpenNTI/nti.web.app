Ext.define('NextThought.view.account.notifications.types.ForumComment', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-forum-comment',

	keyVal: [
		'application/vnd.nextthought.forums.generalforumcomment',
		'application/vnd.nextthought.forums.contentforumcomment'
	],

	itemCls: 'comment',
	showCreator: true,
	previewField: 'bodyPreview',
	quotePreview: false,
	wording: 'NextThought.view.account.notifications.types.ForumComment.wording',

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
	},


	getBody: function(values) {
		if (this.panel.isActivityWindow) {
			return this.getBodyTpl(values.bodyPreview);
		}

		return '';
	}
});
