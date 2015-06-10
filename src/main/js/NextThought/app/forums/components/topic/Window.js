Ext.define('NextThought.app.forums.components.topic.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.topic-window',

	layout: 'none',
	cls: 'topic-window',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading',
		'NextThought.model.forums.CommunityHeadlineTopic',
		'NextThought.app.forums.components.topic.parts.*'
	],


	initComponent: function() {
		this.callParent(arguments);

		var me = this,
			loadForum;

		if (me.precache.forum) {
			loadForum = Promise.resolve(me.precache.forum);
		} else {
			loadForum = Service.getObject(me.record.get('ContainerId'));
		}

		me.add({
			xtype: 'window-header',
			doClose: me.doClose.bind(me)
		});

		me.loadingEl = me.add({xtype: 'window-loading'});

		loadForum
			.then(function(forum) {
				me.forum = forum;

				me.remove(me.loadingEl);

				if (me.record) {
					me.showTopic();
				} else {
					me.showEditor();
				}
			});
	},


	showTopic: function() {
		var topic, comment,
			commentRecord = this.precache.activeComment;

		topic = this.add({xtype: 'forums-topic-topic', record: this.record, forum: this.forum});
		comment = this.add({xtype: 'forums-topic-comment-thread', topic: this.record, activeComment: commentRecord});

		if (!comment.ready) {
			this.mon(comment, {
				single: true,
				ready: function() {
					//TODO: highlight results
					topic.buildCommentPagingNav(comment);
				}
			});
		} else {
			//TODO: highlight results
			topic.buildCommentPagingNav(comment);
		}

		this.mon(topic, {
			'create-root-reply': comment.addRootReply.bind(comment),
			'record-deleted': this.doClose.bind(this)
		});
	},


	showEditor: function() {

	}
}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.forums.CommunityHeadlineTopic.mimeType, this);
});
