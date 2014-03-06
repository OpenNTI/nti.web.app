Ext.define('NextThought.view.forums.topic.Body', {
	extend: 'NextThought.view.forums.hierarchy.Body',
	alias: 'widget.forums-topic-body',

	requires: [
		'NextThought.view.forums.topic.parts.*'
	],

	cls: 'topic-body forum-body',

	allowSelectionChange: function() {
		return !this.editor;
	},


	setCurrent: function(record, forum, pageSource) {
		if (!record) { return; }

		if (this.editor && !this.editor.savedSuccess && !this.editor.isClosed) {
			return false;
		}

		var me = this, topicContainer = this.down('[isTopicContainer]'),
			topic, comment,
			header = this.down('forums-topic-header');

		Ext.destroy(header, topicContainer);

		delete pageSource.disabled;
		header = this.add({
			xtype: 'forums-topic-header',
			record: record,
			forum: forum,
			pageSource: pageSource
		});

		topicContainer = this.add({xtype: 'container', cls: 'topic-container scroll-content', isTopicContainer: true});

		topic = topicContainer.add({xtype: 'forums-topic-topic', record: record, forum: forum});
		comment = topicContainer.add({xtype: 'forums-topic-comment-thread', topic: record});

		if (forum.comment) {
			comment.goToComment(forum.comment);
		}

		this.mon(topic, {
			'create-root-reply': function() {
				comment.addRootReply();
			},
			'record-deleted': function() {
				if (cfg.nextIndex) {
					me.fireEvent('record-deleted', cfg.nextIndex);
				} else if (cfg.previousIndex >= 0) {
					me.fireEvent('record-deleted', cfg.previousIndex);
				} else {
					me.fireEvent('record-deleted', 1);
				}
			}
		});

		this.relayEvents(header, ['goto-record', 'pop-view', 'pop-to-root']);

		this.currentRecord = record;

		return true;
	},


	showEditor: function(record, forum, pageSource, closeCallback) {
		var me = this,
			topicContainer = this.down('[isTopicContainer]'),
			header = this.down('forum-topic-header');

		if (this.editor && !this.editor.savedSuccess && !this.editor.isClosed) {
			return false;
		}

		Ext.destroy(header, topicContainer);

		pageSource.disabled = true;

		header = me.add({xtype: 'forums-topic-header', record: record, forum: forum, pageSource: pageSource});

		topicContainer = me.add({xtype: 'container', cls: 'topic-container scroll-content', isTopicContainer: true});

		me.editor = topicContainer.add({xtype: 'forums-topic-editor', record: record, forum: forum, closeCallback: closeCallback});

		me.mon(me.editor, 'destroy', function() {
			delete me.editor;
			Ext.destroy(header, topicContainer);
		});

		me.relayEvents(header, ['pop-view']);
		me.relayEvents(me.editor, ['goto-record', 'pop-view', 'new-record']);

		return true;
	}
});
