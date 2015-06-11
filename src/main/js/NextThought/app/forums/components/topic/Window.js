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

		var me = this,
			loadForum;

		me.WindowActions = NextThought.app.windows.Actions.create();

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


	allowNavigation: function() {
		var editor = this.down('forums-topic-editor'),
			comment = this.down('forums-topic-comment-thread');

		if (!editor && !comment) {
			return true;
		}

		return (editor && editor.allowNavigation()) || (comment && comment.allowNavigation());
	},


	showTopic: function() {
		var topic = this.down('forums-topic-topic'),
			comment = this.down('forums-topic-comment-thread'),
			commentRecord = this.precache.activeComment;

		if (topic) {
			Ext.destroy(topic);
			Ext.destroy(comment);
		}

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
			'record-deleted': this.doClose.bind(this),
			'edit-topic': this.showEditor.bind(this)
		});
	},


	showEditor: function() {
		var me = this,
			topic = this.down('forums-topic-topic'),
			comment = this.down('forums-topic-comment-thread'),
			editor;

		if (topic) {
			Ext.destroy(topic);
			Ext.destroy(comment);
		}

		editor = me.add({xtype: 'forums-topic-editor', record: this.record, forum: me.forum});

		me.mon(editor, {
			'cancel': function(rec) {
				me.remove(editor);

				if (me.record) {
					me.showTopic();
				} else {
					me.doClose();
				}
			},
			'after-save': function(rec) {
				me.remove(editor);
				me.record = rec;
				me.showTopic();
			}
		})
	}
}, function() {
	NextThought.app.windows.StateStore.register(NextThought.model.forums.CommunityHeadlineTopic.mimeType, this);
	NextThought.app.windows.StateStore.register('new-topic', this);
});
