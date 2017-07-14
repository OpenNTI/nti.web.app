const Ext = require('extjs');
const AnalyticsUtil = require('../../../../util/Analytics');
const {isFeature} = require('legacy/util/Globals');

require('../../../../model/forums/DFLHeadlineTopic');
require('../../../windows/StateStore');
require('../../../windows/components/Header');
require('../../../windows/components/Loading');
require('../../../windows/Actions');
require('../../../../model/forums/CommunityHeadlineTopic');
require('../../../../model/forums/ContentHeadlineTopic');
require('../../../../model/forums/CommunityHeadlinePost');
require('./parts/Comments');
require('./parts/Editor');
require('./parts/Pager');
require('./parts/Topic');
require('./parts/CommentControls');


module.exports = exports = Ext.define('NextThought.app.forums.components.topic.Window', {
	extend: 'Ext.container.Container',
	alias: 'widget.topic-window',
	layout: 'none',
	cls: 'topic-window',

	initComponent: function () {
		this.callParent(arguments);

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.headerCmp = this.add({
			xtype: 'window-header',
			doClose: this.onClose.bind(this),
			doNavigate: this.doNavigate.bind(this)
		});

		this.loadingEl = this.add({xtype: 'window-loading'});

		if (!this.record || this.state === 'edit') {
			this.loadEditor();
		} else if (this.record instanceof NextThought.model.forums.CommentPost) {
			this.loadComment();
		} else if (this.record instanceof NextThought.model.forums.CommunityHeadlinePost) {
			this.loadPost();
		} else {
			this.loadTopic();
		}
	},

	onClose: function () {
		this.doClose(this.activeTopic);
	},

	loadForum: function (topic) {
		if (this.precache.forum) {
			return Promise.resolve(this.precache.forum);
		}

		return Service.getObject(topic.get('ContainerId'));
	},

	loadTopic: function () {
		var me = this;

		me.loadForum(me.record)
			.then(function (forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showTopic(me.record, forum);
				me.headerCmp.showPathFor(me.record, me.record.get('title'));
			});
	},

	loadComment: function () {
		var me = this,
			topic;

		Service.getObject(me.record.get('ContainerId'))
			.then(function (t) {
				topic = t;

				return me.loadForum(topic);
			})
			.then(function (forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showTopic(topic, forum, me.record);
				me.headerCmp.showPathFor(topic);
			});
	},

	loadPost: function () {
		var me = this,
			topic;

		Service.getObject(me.record.get('ContainerId'))
			.then(function (t) {
				topic = t;

				return me.loadForum(topic);
			})
			.then(function (forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showTopic(topic, forum);
				me.headerCmp.showPathFor(topic);
			});
	},

	loadEditor: function () {
		var me = this;

		me.loadForum(me.record)
			.then(function (forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showEditor(me.record, forum);
				me.headerCmp.showPathFor(forum, 'New Discussion', -1, forum.getTitle());
			});
	},

	allowNavigation: function () {
		var editor = this.down('forums-topic-editor'),
			comment = this.down('forums-topic-comment-thread');

		if (!editor && !comment) {
			return true;
		}

		return (editor && editor.allowNavigation()) || (comment && comment.allowNavigation());
	},

	showTopic: function (topic, forum, activeComment) {
		var topicCmp = this.down('forums-topic-topic'),
			commentCmp = this.down('forums-topic-comment-thread'),
			controlCmp = this.down('forums-topic-comment-controls'),
			me = this;

		function stopTimer () {
			if (me.currentAnalyticId && me.hasCurrentTimer) {
				delete me.hasCurrentTimer;
				AnalyticsUtil.stopResourceTimer(me.currentAnalyticId, 'discussion-viewed');
			}
		}

		function startTimer () {
			if (!me.hasCurrentTimer) {
				me.hasCurrentTimer = true;

				AnalyticsUtil.getResourceTimer(me.currentAnalyticId, {
					type: 'discussion-viewed',
					'topic_id': me.currentAnalyticId
				});
			}
		}

		this.activeTopic = topic;

		if (topic && topic.getId() !== this.currentAnalyticId) {
			stopTimer();
			this.currentAnalyticId = topic.getId();
			startTimer();
		}

		if (!this.visibilityMonitors) {
			this.visibilityMonitors = this.on({
				'destroy': function () {
					Ext.destroy(me.visibilityMonitors);
					stopTimer();
				},
				'visibility-changed': function (visible) {
					//start the time when we become visible, stop it when we hide
					if (visible) {
						startTimer();
					} else {
						stopTimer();
					}
				}
			}, me, {destroyable: true});
		}


		if (topic) {
			Ext.destroy(topicCmp);
			Ext.destroy(commentCmp);
			Ext.destroy(controlCmp);
		}

		topicCmp = this.add({xtype: 'forums-topic-topic', record: topic, forum});

		if (isFeature('forum-comment-expand-collapse')) {
			controlCmp = this.add({xtype: 'forums-topic-comment-controls'});
		} else {
			controlCmp = null;
		}

		commentCmp = this.add({xtype: 'forums-topic-comment-thread', topic: topic, activeComment: activeComment});

		if (controlCmp) {
			controlCmp.setCommentCmp(commentCmp);
		}

		if (!commentCmp.ready) {
			this.mon(commentCmp, {
				single: true,
				ready: function () {
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
			'edit-topic': this.showEditor.bind(this, topic, forum)
		});
	},


	showEditor: function (topic, forum) {
		var me = this,
			topicCmp = this.down('forums-topic-topic'),
			commentCmp = this.down('forums-topic-comment-thread'),
			controlCmp = this.down('forums-topic-comment-controls'),
			editor;

		if (topicCmp) {
			Ext.destroy(topicCmp);
			Ext.destroy(commentCmp);
			Ext.destroy(controlCmp);
		}

		editor = me.add({xtype: 'forums-topic-editor', record: topic, forum: forum});

		me.mon(editor, {
			'cancel': function (/*rec*/) {
				me.remove(editor);

				if (me.record) {
					me.showTopic(topic, forum);
				} else {
					me.doClose();
				}
			},
			'after-save': function (rec) {
				me.remove(editor);
				me.record = rec;
				me.showTopic(rec, forum);

				if (me.monitors && me.monitors.afterSave) {
					me.monitors.afterSave(rec);
				}
			}
		});
	}
}, function () {
	NextThought.app.windows.StateStore.register('application/vnd.nextthought.forums.generalforumcomment', this);
	NextThought.app.windows.StateStore.register(NextThought.model.forums.ContentHeadlineTopic.mimeType, this);
	NextThought.app.windows.StateStore.register(NextThought.model.forums.CommunityHeadlineTopic.mimeType, this);
	NextThought.app.windows.StateStore.register(NextThought.model.forums.DFLHeadlineTopic.mimeType, this);
	NextThought.app.windows.StateStore.register(NextThought.model.forums.CommunityHeadlinePost.mimeType, this);
	NextThought.app.windows.StateStore.register('new-topic', this);
});
