Ext.define('NextThought.view.forums.topic.Body', {
	extend: 'NextThought.view.forums.hierarchy.Body',
	alias: 'widget.forums-topic-body',

	requires: [
		'NextThought.view.forums.topic.parts.*'
	],

	cls: 'topic-body forum-body scrollable',

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
		comment = topicContainer.add({xtype: 'forums-topic-comment-thread', topic: record, activeComment: forum.comment});

		//wait until the comments are loaded to fire highlight-ready
		if (!comment.ready) {
			me.mon(comment, {
				single: true,
				ready: function() {
					me.fireEvent('highlight-ready');
				}
			});
		} else {
			me.fireEvent('highlight-ready');
		}

		Ext.destroy(this.topicMonitors);
		this.topicMonitors = this.mon(topic, {
			destroyable: true,
			'create-root-reply': function() {
				comment.addRootReply();
			},
			'record-deleted': function() {
				if (pageSource.hasNext()) {
					me.fireEvent('record-deleted', pageSource.getNext());
				} else if (pageSource.hasPrevious()) {
					me.fireEvent('record-deleted', pageSource.getPrevious());
				} else {
					me.fireEvent('record-deleted', 1);
				}
			}
		});

		this.relayEvents(header, ['goto-record', 'pop-view', 'pop-to-root']);

		this.currentRecord = record;

		return true;
	},


	addIncomingComment: function(comment) {
		var comments = this.down('forums-topic-comment-thread'),
			topic = this.down('forums-topic-topic');

		if (comments) {
			comments.addIncomingComment(comment);
			topic.commentAdded();
		}
	},


	showSearchHit: function(hit, frag) {
		var topic = this.down('forums-topic-topic'),
			comments = this.down('forums-topic-comment-thread');

		if (comments && hit.get('Type') === 'GeneralForumComment') {
			comments.showSearchHit(hit, frag);
		}

		if (topic && hit.get('Type') === 'CommunityHeadlinePost') {
			topic.showSearchHit(hit, frag);
		}
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
