const Ext = require('@nti/extjs');
const { scoped } = require('@nti/lib-locale');
const { Forums } = require('@nti/web-discussions');
const { Prompt } = require('@nti/web-commons');
const WindowsActions = require('internal/legacy/app/windows/Actions');
const WindowsStateStore = require('internal/legacy/app/windows/StateStore');
const CommentPost = require('internal/legacy/model/forums/CommentPost');
const DFLHeadlineTopic = require('internal/legacy/model/forums/DFLHeadlineTopic');
const CommunityHeadlineTopic = require('internal/legacy/model/forums/CommunityHeadlineTopic');
const ContentHeadlineTopic = require('internal/legacy/model/forums/ContentHeadlineTopic');
const CommunityHeadlinePost = require('internal/legacy/model/forums/CommunityHeadlinePost');
const DFLHeadlinePost = require('internal/legacy/model/forums/DFLHeadlinePost');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const { isFeature } = require('internal/legacy/util/Globals');

require('internal/legacy/overrides/ReactHarness');
require('internal/legacy/app/windows/components/Header');
require('internal/legacy/app/windows/components/Loading');
require('internal/legacy/app/windows/Actions');
require('./parts/Comments');
require('./parts/Editor');
require('./parts/Pager');
require('./parts/Topic');
require('./parts/CommentControls');

const text = scoped('nti-web-app.app.forums.components.topic.Window', {
	notFound: 'Unable to load item.',
});

module.exports = exports = Ext.define(
	'NextThought.app.forums.components.topic.Window',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.topic-window',
		layout: 'none',
		cls: 'topic-window',

		initComponent: function () {
			this.callParent(arguments);

			this.WindowActions = WindowsActions.create();

			if (!this.hideHeader) {
				this.headerCmp = this.add({
					xtype: 'window-header',
					doClose: this.onClose.bind(this),
					doNavigate: this.doNavigate.bind(this),
				});
			}

			this.loadingEl = this.add({ xtype: 'window-loading' });

			if (!this.record || this.state === 'edit') {
				this.loadEditor();
			} else if (this.record instanceof CommentPost) {
				this.loadComment();
			} else if (
				this.record instanceof CommunityHeadlinePost ||
				this.record instanceof DFLHeadlinePost
			) {
				this.loadPost();
			} else {
				this.loadTopic();
			}
		},

		onClose: function () {
			this.doClose(this.activeTopic);
		},

		onNoAccess() {
			this.doClose();
			Prompt.alert(text('notFound'));
		},

		loadForum: function (topic) {
			if (this.precache.forum) {
				return Promise.resolve(this.precache.forum);
			}

			return Service.getObject(topic.get('ContainerId')).catch(() => {
				return {
					isMockForum: true,
					getId: () => topic && topic.get('ContainerId'),
				};
			});
		},

		loadTopic: function () {
			var me = this;

			me.loadForum(me.record)
				.then(function (forum) {
					me.forum = forum;

					me.remove(me.loadingEl);
					me.showTopic(me.record, forum);

					if (me.headerCmp) {
						me.headerCmp.showPathFor(
							me.record,
							me.record.get('title')
						);
					}
				})
				.catch(() => this.onNoAccess());
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

					if (me.headerCmp) {
						me.headerCmp.showPathFor(topic);
					}
				})
				.catch(() => this.onNoAccess());
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

					if (me.headerCmp) {
						me.headerCmp.showPathFor(topic);
					}
				});
		},

		loadEditor: function () {
			var me = this;

			me.loadForum(me.record).then(function (forum) {
				me.forum = forum;

				me.remove(me.loadingEl);
				me.showEditor(me.record, forum);

				if (me.headerCmp) {
					me.headerCmp.showPathFor(
						forum,
						'New Discussion',
						-1,
						forum.getTitle()
					);
				}
			});
		},

		allowNavigation: function () {
			var editor = this.down('forums-topic-editor'),
				comment = this.down('forums-topic-comment-thread');

			if (!editor && !comment) {
				return true;
			}

			return (
				(editor && editor.allowNavigation()) ||
				(comment && comment.allowNavigation())
			);
		},

		showNewComment() {
			const commentCmp = this.down('forums-topic-comment-thread');

			if (commentCmp && commentCmp.ready) {
				commentCmp.addRootReply();
			} else if (commentCmp) {
				this.mon(commentCmp, {
					single: true,
					ready: () => this.showNewComment(),
				});
			} else {
				this.on({
					single: true,
					'topic-setup': () => this.showNewComment(),
				});
			}
		},

		selectComment(comment) {
			const commentCmp = this.down('forums-topic-comment-thread');

			if (commentCmp && commentCmp.ready) {
				commentCmp.goToComment(comment);
			} else if (commentCmp) {
				this.mon(commentCmp, {
					single: true,
					ready: () => this.selectComment(comment),
				});
			} else {
				this.on({
					single: true,
					'topic-setup': () => this.selectComment(comment),
				});
			}
		},

		showEditMode() {
			this.loadEditor();
		},

		beforeDestroy() {
			this.callParent(arguments);
			this.stopCurrentAnalyticEvent?.();
			this.dead = true;
		},

		startAnalyticEvent(topicId) {
			this.stopCurrentAnalyticEvent?.();
			this.stopCurrentAnalyticEvent = () =>
				AnalyticsUtil.stopEvent(topicId, 'TopicView');

			AnalyticsUtil.startEvent(topicId, 'TopicView');
		},

		showTopic(topic, forum, activeComment) {
			if (this.dead) {
				return;
			}
			let topicCmp = this.down('forums-topic-topic');
			let commentCmp = this.down('forums-topic-comment-thread');
			let controlCmp = this.down('forums-topic-comment-controls');

			const stopTimer = () => this.stopCurrentAnalyticEvent?.();

			const startTimer = () => this.startAnalyticEvent(topic?.getId());

			this.activeTopic = topic;

			if (topic?.getId() !== this.currentAnalyticId) {
				stopTimer();
				this.currentAnalyticId = topic?.getId();

				if (topic) startTimer();
			}

			if (!this.visibilityMonitors) {
				this.visibilityMonitors = this.on(
					{
						destroy: () => {
							Ext.destroy(this.visibilityMonitors);
						},
						'visibility-changed': visible => {
							//start the time when we become visible, stop it when we hide
							if (visible) {
								startTimer();
							} else {
								stopTimer();
							}
						},
					},
					this,
					{ destroyable: true }
				);
			}

			if (topic) {
				Ext.destroy(topicCmp);
				Ext.destroy(commentCmp);
				Ext.destroy(controlCmp);
			}

			topicCmp = this.add({
				xtype: 'forums-topic-topic',
				record: topic,
				forum,
			});

			controlCmp = this.add({
				xtype: 'forums-topic-comment-controls',
			});

			commentCmp = this.add({
				xtype: 'forums-topic-comment-thread',
				topic: topic,
				activeComment: activeComment,
			});

			if (controlCmp) {
				controlCmp.setCommentCmp(commentCmp);
			}

			if (!commentCmp.ready) {
				this.mon(commentCmp, {
					single: true,
					ready: function () {
						//TODO: highlight results
						topicCmp.buildCommentPagingNav(commentCmp);
					},
				});
			} else {
				//TODO: highlight results
				topicCmp.buildCommentPagingNav(commentCmp);
			}

			this.mon(topicCmp, {
				'create-root-reply': commentCmp.addRootReply.bind(commentCmp),
				'record-deleted': this.doClose.bind(this),
				'edit-topic': this.showEditor.bind(this, topic, forum),
			});

			this.fireEvent('topic-setup');
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

			if (!topic && forum.get('EmailNotifications')) {
				me.add({
					xtype: 'react',
					component: Forums.EmailNotificationBar,
				});
			}

			editor = me.add({
				xtype: 'forums-topic-editor',
				record: topic,
				forum: forum,
			});

			me.mon(editor, {
				cancel: function (/*rec*/) {
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
				},
			});
		},
	},
	function () {
		WindowsStateStore.register(
			'application/vnd.nextthought.forums.generalforumcomment',
			this
		);
		WindowsStateStore.register(ContentHeadlineTopic.mimeType, this);
		WindowsStateStore.register(CommunityHeadlineTopic.mimeType, this);
		WindowsStateStore.register(DFLHeadlineTopic.mimeType, this);
		WindowsStateStore.register(CommunityHeadlinePost.mimeType, this);
		WindowsStateStore.register(DFLHeadlinePost.mimeType, this);
		WindowsStateStore.register('new-topic', this);
	}
);
