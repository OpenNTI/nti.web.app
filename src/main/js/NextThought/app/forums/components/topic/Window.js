Ext.define('NextThought.app.forums.components.topic.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.topic-window',

	layout: 'none',
	cls: 'topic-window',

	requires: [
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.components.Header',
		'NextThought.app.windows.components.Loading',
		'NextThought.app.windows.Actions',
		'NextThought.model.forums.CommunityHeadlineTopic',
		'NextThought.app.forums.components.topic.parts.*'
	],


	initComponent: function() {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.add({
			xtype: 'window-header',
			doClose: this.doClose.bind(this)
		});

		this.loadingEl = this.add({xtype: 'window-loading'});

		if (!this.record) {
			this.loadEditor();
		} else if (this.record instanceof NextThought.model.forums.CommentPost) {
			this.loadComment();
		} else {
			this.loadTopic();
		}
	},


	loadForum: function(topic) {
		if (this.precache.forum) {
			return Promise.resolve(this.precache.forum);
		}

		return Service.getObject(topic.get('ContainerId'));
	},


	loadTopic: function() {
		var me = this;

		loadForum(me.record)
			.then(function(forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showTopic(me.record, forum);
			});
	},


	loadComment: function() {
		var me = this,
			topic;

		Service.getObject(me.record.get('ContainerId'))
			.then(function(t) {
				topic = t;

				return me.loadForum(topic);
			})
			.then(function(forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showTopic(topic, forum, me.record);
			});
	},


	loadEditor: function() {
		var me = this;

		me.loadForum(me.record)
			.then(function(forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showEditor(me.record, forum);
			});
	},


	allowNavigation: function() {
		var editor = this.down('forums-topic-editor'),
			comment = this.down('forums-topic-comment-thread');

		if (!editor && !comment) {
			return true;
		}

		return (editor && editor.allowNavigation()) || (comment && comment.allowNavigation());
	},


	showTopic: function(topic, forum, activeComment) {
		var topicCmp = this.down('forums-topic-topic'),
			commentCmp = this.down('forums-topic-comment-thread');

		if (topic) {
			Ext.destroy(topicCmp);
			Ext.destroy(commentCmp);
		}

		topicCmp = this.add({xtype: 'forums-topic-topic', record: topic, forum: forum});
		commentCmp = this.add({xtype: 'forums-topic-comment-thread', topic: topic, activeComment: activeComment});

		if (!commentCmp.ready) {
			this.mon(commentCmp, {
				single: true,
				ready: function() {
					//TODO: highlight results
					topicCmp.buildCommentPagingNav(commentCmp);
				}
			});
		} else {
			//TODO: highlight results
			topicCmp.buildCommentPagingNav(commentCmp);
		}

		this.mon(topicCmp, {
			'create-root-reply': commentCmp.addRootReply.bind(commentCmp),
			'record-deleted': this.doClose.bind(this),
			'edit-topic': this.showEditor.bind(this)
		});
	},


	showEditor: function(topic, forum) {
		var me = this,
			topicCmp = this.down('forums-topic-topic'),
			commentCmp = this.down('forums-topic-comment-thread'),
			editor;

		if (topicCmp) {
			Ext.destroy(topicCmp);
			Ext.destroy(commentCmp);
		}

		editor = me.add({xtype: 'forums-topic-editor', record: topic, forum: forum});

		me.mon(editor, {
			'cancel': function(rec) {
				me.remove(editor);

				if (me.record) {
					me.showTopic(topic, forum);
				} else {
					me.doClose();
				}
			},
			'after-save': function(rec) {
				me.remove(editor);
				me.record = rec;
				me.showTopic(rec, forum);
			}
		});
	}
}, function() {
	NextThought.app.windows.StateStore.register('application/vnd.nextthought.forums.generalforumcomment', this);
	NextThought.app.windows.StateStore.register(NextThought.model.forums.ContentHeadlineTopic.mimeType, this);
	NextThought.app.windows.StateStore.register(NextThought.model.forums.CommunityHeadlineTopic.mimeType, this);
	NextThought.app.windows.StateStore.register('new-topic', this);
});
