Ext.define('NextThought.app.notifications.components.types.ForumTopic', {
	extend: 'NextThought.app.notifications.components.types.Note',
	alias: 'widget.notification-item-forum-topic',

	keyVal: [
		'application/vnd.nextthought.forums.communityheadlinetopic',
		'application/vnd.nextthought.forums.contentheadlinetopic'
	],

	wording: getString('NextThought.view.account.notifications.types.ForumTopic.wording', '{creator} created a discussion: {title}'),

	getWording: function(values) {
		if (!this.wording) {
			return '';
		}

		var creator = this.getDisplayNameTpl(values);

		return getFormattedString(this.wording, {
			creator: creator,
			title: values.title
		});
	},


	fillInData: function(rec) {
		return NextThought.view.account.notifications.types.Base.prototype.fillInData.apply(this, arguments);
	},

	clicked: function(view, rec) {
		//TODO: figure this out
	}
});
