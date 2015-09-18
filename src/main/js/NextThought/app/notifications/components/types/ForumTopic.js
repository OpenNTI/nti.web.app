Ext.define('NextThought.app.notifications.components.types.ForumTopic', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-forum-topic',

	statics: {
		keyVal: [
			'application/vnd.nextthought.forums.communityheadlinetopic',
			'application/vnd.nextthought.forums.contentheadlinetopic'
		]
	},

	wording: 'created a discussion {title}',


	fillInWording: function() {
		var wording = this.wording;

		wording = wording.replace('{title}', this.titleTpl.apply({name: this.record.get('title')}));

		this.wordingEl.dom.innerHTML = wording;
	}

});

// Ext.define('NextThought.app.notifications.components.types.ForumTopic', {
// 	extend: 'NextThought.app.notifications.components.types.Note',
// 	alias: 'widget.notification-item-forum-topic',

// 	keyVal: [
// 		'application/vnd.nextthought.forums.communityheadlinetopic',
// 		'application/vnd.nextthought.forums.contentheadlinetopic'
// 	],

// 	wording: getString('NextThought.view.account.notifications.types.ForumTopic.wording', '{creator} created a discussion: {title}'),

// 	getWording: function(values) {
// 		if (!this.wording) {
// 			return '';
// 		}

// 		var creator = this.getDisplayNameTpl(values);

// 		return getFormattedString(this.wording, {
// 			creator: creator,
// 			title: values.title
// 		});
// 	},


// 	fillInData: function(rec) {
// 		return NextThought.app.notifications.components.types.Base.prototype.fillInData.apply(this, arguments);
// 	},

// 	clicked: function(view, rec) {
// 		//TODO: figure this out
// 	}
// });
