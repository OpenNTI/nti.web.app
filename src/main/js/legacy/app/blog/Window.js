const Ext = require('@nti/extjs');
const AnalyticsUtil = require('internal/legacy/util/Analytics');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const PersonalBlogEntry = require('internal/legacy/model/forums/PersonalBlogEntry');
const PersonalBlogComment = require('internal/legacy/model/forums/PersonalBlogComment');
const PersonalBlogEntryPost = require('internal/legacy/model/forums/PersonalBlogEntryPost');

const WindowsActions = require('../windows/Actions');
const WindowsStateStore = require('../windows/StateStore');

require('../windows/components/Header');
require('../windows/components/Loading');

require('./parts/Editor');
require('./parts/Post');

module.exports = exports = Ext.define(
	'NextThought.app.blog.Window',
	{
		extend: 'Ext.container.Container',
		alias: 'widget.blog-window',
		layout: 'none',
		cls: 'blog-window',
		items: [],

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
			} else if (this.record instanceof PersonalBlogEntry) {
				this.loadBlogPost();
			} else if (this.record instanceof PersonalBlogEntryPost) {
				this.loadBlogEntry();
			} else if (this.record instanceof PersonalBlogComment) {
				this.loadBlogComment();
			}
		},

		onClose: function () {
			this.doClose(this.activeBlogPost);
		},

		loadBlog: function () {
			if (this.precache.blog) {
				return Promise.resolve(this.precache.blog);
			}

			var collection = Service.getCollection('Blog'),
				href = collection && collection.href;

			if (!href) {
				return Promise.reject('No Href');
			}

			return Service.request(href).then(function (resp) {
				return lazy.ParseUtils.parseItems(resp)[0];
			});
		},

		loadBlogPost: function () {
			this.remove(this.loadingEl);

			this.showBlogPost(this.record);
		},

		loadBlogEntry: function () {
			var entry = this.record.get('ContainerId'),
				me = this;

			return Service.getObject(entry).then(function (blogPost) {
				me.remove(me.loadingEl);
				me.showBlogPost(blogPost);
			});
		},

		loadBlogComment: function () {
			var me = this,
				postId = me.record.get('ContainerId');

			Service.getObject(postId).then(function (blogPost) {
				me.remove(me.loadingEl);
				me.showBlogPost(blogPost, me.record);
			});
		},

		loadEditor: function (blogPost) {
			var me = this;

			me.loadBlog().then(function (blog) {
				me.remove(me.loadingEl);

				me.showEditor(blogPost || me.record, blog);

				//TODO: Show Path
			});
		},

		showBlog: function () {},

		showBlogPost: function (blogPost, activeComment) {
			var me = this,
				blogPostCmp = this.down('profile-blog-post');

			me.headerCmp.showPathFor(me.record, 'Thoughts', 3);

			function startTimer() {
				if (!me.hasCurrentTimer) {
					me.hasCurrentTimer = true;

					AnalyticsUtil.startEvent(
						me.currentAnalyticId,
						'ThoughtView'
					);
				}
			}

			function stopTimer() {
				if (me.currentAnalyticId && me.hasCurrentTimer) {
					delete me.hasCurrentTimer;
					AnalyticsUtil.stopEvent(
						me.currentAnalyticId,
						'ThoughtView'
					);
				}
			}

			me.activeBlogPost = blogPost;

			if (blogPost && blogPost.getId() !== me.currentAnalyticId) {
				stopTimer();
				me.currentAnalyticId = blogPost.getId();
				startTimer();
			}

			if (!me.visibilityMonitors) {
				me.visibilityMonitors = me.on(
					{
						destroy: function () {
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
						},
					},
					me,
					{ destroyable: true }
				);
			}

			if (blogPostCmp) {
				Ext.destroy(blogPostCmp);
			}

			blogPostCmp = this.add({
				xtype: 'profile-blog-post',
				record: blogPost,
				scrollToComment: activeComment,
			});

			this.mon(blogPostCmp, {
				'record-deleted': me.doClose.bind(this),
				'edit-topic': me.loadEditor.bind(this),
			});
		},

		showEditor: function (blogPost, blog) {
			var me = this,
				blogPostCmp = this.down('profile-blog-post'),
				sharingInfo = blogPost && blogPost.getSharingInfo(),
				editor;

			if (blogPostCmp) {
				Ext.destroy(blogPostCmp);
			}

			if (sharingInfo && sharingInfo.publicToggleOn) {
				sharingInfo.entities.push(Service.getFakePublishCommunity());
			} else if (!sharingInfo) {
				sharingInfo = { entities: [Service.getFakePublishCommunity()] };
			}

			editor = me.add({
				xtype: 'profile-blog-editor',
				record: blogPost,
				blog: blog,
				sharingValue: sharingInfo,
			});

			me.mon(editor, {
				cancel: function (rec) {
					me.remove(editor);

					if (blogPost) {
						me.showBlogPost(blogPost);
					} else {
						me.doClose();
					}
				},
				'after-save': function (rec) {
					me.remove(editor);
					me.record = rec;
					me.showBlogPost(rec);

					if (me.monitors && me.monitors.afterSave) {
						me.monitors.afterSave(rec);
					}
				},
			});
		},
	},
	function () {
		WindowsStateStore.register('new-blog', this);
		WindowsStateStore.register(PersonalBlogEntry.mimeType, this);
		WindowsStateStore.register(PersonalBlogComment.mimeType, this);
		WindowsStateStore.register(PersonalBlogEntryPost.mimeType, this);
	}
);
