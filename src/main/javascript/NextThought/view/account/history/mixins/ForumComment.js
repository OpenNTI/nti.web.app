Ext.define('NextThought.view.account.history.mixins.ForumComment', {
	extend: 'NextThought.view.account.history.mixins.Base',
	alias: 'widget.history-item-forum-comment',

	keyVal: 'application/vnd.nextthought.forums.generalforumcomment',

	itemCls: 'comment',
	showCreator: true,
	previewField: 'bodyPreview',
	quotePreview: false,
	verb: 'commented',

	fillInData: function(rec) {
		this.callParent(arguments);
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
