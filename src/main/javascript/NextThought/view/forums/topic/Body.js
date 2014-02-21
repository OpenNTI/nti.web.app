Ext.define('NextThought.view.forums.topic.Body', {
	extend: 'NextThought.view.forums.hierarchy.Body',
	alias: 'widget.forums-topic-body',

	require: [
		'NextThought.view.forums.topic.parts.*'
	],

	cls: 'topic-body forum-body',

	allowSelectionChange: function() {
		return !this.editor;
	},


	setCurrent: function(record, forum, cfg) {
		if (!record) { return; }

		var topicContainer = this.down('[isTopicContainer]'),
			topic, comment,
			header = this.down('forums-topic-header');

		Ext.destroy(header, topicContainer);

		header = this.add({xtype: 'forums-topic-header', record: record, forum: forum, nextIndex: cfg.nextIndex, previousIndex: cfg.previousIndex});

		topicContainer = this.add({xtype: 'container', cls: 'topic-container scroll-content', isTopicContainer: true});

		topic = topicContainer.add({xtype: 'forums-topic-topic', record: record, forum: forum});
		comment = topicContainer.add({xtype: 'forums-topic-comment-thread', topic: record});

		if (forum.comment) {
			comment.goToComment(forum.comment);
		}

		this.mon(topic, {
			'create-root-reply': function() {
				comment.addRootReply();
			}
		});

		this.relayEvents(header, ['goto-index', 'pop-view']);

		return true;
	},


	showEditor: function(record, forum, closeCallback) {
		var me = this,
			topicContainer = this.down('[isTopicContainer]'),
			header = this.down('forum-topic-header');

		Ext.destroy(header, topicContainer);

		header = me.add({xtype: 'forums-topic-header', record: record, forum: forum});

		topicContainer = me.add({xtype: 'container', cls: 'topic-container scroll-content', isTopicContainer: true});

		me.editor = topicContainer.add({xtype: 'forums-topic-editor', record: record, forum: forum, closeCallback: closeCallback});

		me.mon(me.editor, 'destroy', function() {
			delete me.editor;
			Ext.destroy(header, topicContainer);
		});

		me.relayEvents(header, ['pop-view']);
		me.relayEvents(me.editor, ['goto-record', 'pop-view']);
	}
});
