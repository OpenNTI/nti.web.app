const Ext = require('@nti/extjs');
const {wait} = require('@nti/lib-commons');
const { dispatch } = require('@nti/lib-dispatcher');
const { Forums } = require('@nti/web-discussions');

const {getString} = require('legacy/util/Localization');
const ContentviewerActions = require('legacy/app/contentviewer/Actions');
const DomUtils = require('legacy/util/Dom');
const SearchUtils = require('legacy/util/Search');
const TextRangeFinderUtils = require('legacy/util/TextRangeFinder');
const UserRepository = require('legacy/cache/UserRepository');

const ForumsActions = require('../../../Actions');

require('legacy/mixins/FlagActions');
require('legacy/mixins/LikeFavoriteActions');
require('legacy/mixins/ProfileLinks');
require('legacy/mixins/Searchable');
require('legacy/editor/Editor');
require('legacy/common/menus/BlogTogglePublish');
require('legacy/common/ux/SearchHits');
require('legacy/layout/component/Natural');

require('./Pager');


module.exports = exports = Ext.define('NextThought.app.forums.components.topic.parts.Topic', {
	extend: 'Ext.Component',
	alias: 'widget.forums-topic-topic',
	threaded: true,

	mixins: {
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		profileLink: 'NextThought.mixins.ProfileLinks',
		Searchable: 'NextThought.mixins.Searchable'
	},

	onClassExtended: function (cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);
	},

	cls: 'topic-post list',
	scrollParentCls: '.forums-view',
	showPermissions: false,

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'wrap', cn: [
			{ cls: 'controls', cn: [
				{cls: 'favorite'},
				{cls: 'like'}
			]},
			'{headline.Creator:avatar}',
			{ cls: 'title', html: '{title}' },
			{ cls: 'meta', cn: [
				{ tag: 'tpl', 'if': 'showName', cn: { tag: 'span', cls: 'name link', html: '{headline.Creator}'}},
				{ tag: 'span', cls: 'datetime', html: '{CreatedTime:ago}'},
				{ tag: 'tpl', 'if': 'headline.isModifiable || showPermissions', cn: [
					{ tag: 'span', cls: 'state link {publish-state:lowercase}', html: '{publish-state}'}
				]},
				{ tag: 'tpl', 'if': 'headline.isModifiable', cn: [
					{ tag: 'span', cls: 'edit link', html: '{{{NextThought.view.forums.topic.parts.Topic.edit}}}'}
				]},
				{ tag: 'tpl', 'if': 'headline.isDeletable', cn: [
					{ tag: 'span', cls: 'delete link', html: '{{{NextThought.view.forums.topic.parts.Topic.delete}}}'}
				]}
			]},
			{ cls: 'body' },
			{ cls: 'foot', cn: [
				{ tag: 'span', cls: 'tags', cn: [
					{tag: 'tpl', 'for': 'headline.tags', cn: [
						{tag: 'span', cls: 'tag', html: '{.}'}
					]}
				]},
				{ cls: 'comment-box', cn: [
					{ cls: 'response', cn: [
						{ tag: 'span', cls: 'reply-count', html: '{PostCount:plural("Comment")}'},
						{ tag: 'tpl', 'if': 'canReply', cn: [
							{ tag: 'span', cls: 'reply link', html: '{{{NextThought.view.forums.topic.parts.Topic.add}}}' }
						]},
						{ tag: 'span', cls: 'report link', html: '{{{NextThought.view.forums.topic.parts.Topic.report}}}' }
					]}
				]}
			]}
		]},
		{ cls: 'editor-box'}
	]),

	renderSelectors: {
		avatarEl: '.avatar',
		bodyEl: '.body',
		nameEl: '.meta .name',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		flagEl: '.report.link',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		commentBoxEl: '.comment-box',
		replyCountEl: '.comment-box .reply-count',
		responseEl: '.comment-box .response',
		replyLinkEl: '.comment-box .response .reply',
		reportLinkEl: '.comment-box .response .report',
		commentEditorBox: '.editor-box'
	},

	pagingCommentsNavTpl: new Ext.XTemplate(Ext.DomHelper.markup([
		{cls: 'paging-comments-nav'}
	])),

	initComponent: function () {
		this.callParent(arguments);
		this.addEvents(['delete-post', 'show-post', 'ready', 'commentReady']);
		this.enableBubble(['delete-post', 'show-post']);
		this.on('ready', this.onReady, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.on('beforeactivate', this.onBeforeActivate, this);
		this.ForumActions = ForumsActions.create();
	},

	beforeRender: function () {
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);

		var me = this,
			r = this.record;//,s;

		if (!r || !r.getData) {
			Ext.defer(this.destroy, 1, this);
			return;
		}
		//s = r.getPublishState();
		r = this.renderData = Ext.apply(this.renderData || {}, r.getData());
		Ext.apply(r, {
			showName: true,
			canReply: this.canReply()
		});


		if (!r.headline || !r.headline.getData) {
			console.warn('The record does not have a story field or it does not implement getData()', r);

			Ext.defer(this.destroy, 1, this);
			return;
		}
		r.headline = r.headline.getData();

		UserRepository.getUser(r.headline.Creator, function (u) {
			r.headline.Creator = u;
			me.user = u;
			if (me.rendered) {
				me.nameEl.update(u.getName());
				me.avatarEl.setStyle({ backgroundImage: 'url(' + u.get('avatarURL') + ')'});
			}
		});
	},

	afterRender: function () {
		if (Ext.is.iOS) {
			if (this.topicOpen) {
				this.destroy();
				return;
			}
			this.topicOpen = true;
		}

		this.callParent(arguments);

		var h = this.record.get('headline'),
			box = this.responseEl;

		if (!h) {
			return;
		}

		this.scrollParent = this.el.parent(this.scrollParentCls) || this.el.parent('.course-forum');

		//TODO: move this into a mixin so we can share it in the other post widgets (and forum post items)
		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);

		this.record.addObserverForField(this, 'PostCount', this.updateReplyCount, this);
		this.currentPostCount = this.record.get('PostCount');


		if (this.nameEl) {
			this.enableProfileClicks(this.nameEl);
		}

		this.updateContent();
		this.bodyEl.selectable();

		if (this.deleteEl) {
			this.mon(this.deleteEl, 'click', this.onDeletePost, this);
		}

		if (this.editEl) {
			this.mon(this.editEl, 'click', this.onEditPost, this);
		}

		this.setPublishAndSharingState();
		this.reflectFlagged(this.record);
		this.listenForFlagChanges(this.record);

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);

		if (this.replyLinkEl) {
			box.setVisibilityMode(Ext.dom.Element.DISPLAY);

			this.mon(this.replyLinkEl, 'click', this.createRootReply, this);
		}

		this.initSearch();
	},

	canReply: function () {
		return Boolean(this.record && this.record.getLink('add'));
	},

	setPublishAndSharingState: function () {},

	onReady: function () {
		console.debug('ready', arguments);

		this.fireEvent('highlight-ready');
	},

	markAsPublished: function (key, value) {
		const val = value ? 'public' : 'only me';
		const removeCls = value ? 'only me' : 'public';

		// const text = value
		// 		? getString('NextThought.view.forums.topic.parts.Topic.onlyme')
		// 		: getString('NextThought.view.forums.topic.parts.Topic.public');

		this.publishStateEl.addCls(val);
		this.publishStateEl.update(Ext.Array.map(val.split(' '), Ext.String.capitalize).join(' '));
		this.publishStateEl.removeCls(removeCls);
	},

	getMainView: function () {
		var forum = Ext.get('forums'),
			course = Ext.get('course-forum');

		if (forum && forum.isVisible()) {
			return forum;
		}
		if (course && course.isVisible()) {
			return course;
		}
		return null;
	},

	createRootReply: function () {
		this.fireEvent('create-root-reply');
	},

	updateField: function (key, value) {
		var el = this.el.down('.' + key);
		if (el) {
			el.update(value);
		}
	},

	updateContent: function () {
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData, {'application/vnd.nextthought.embeddedvideo': 640});
	},

	updateReplyCount: function (key, value) {
		this.replyCountEl.update(Ext.util.Format.plural(value, 'Comment'));
	},

	commentAdded: function () {
		var oldPostCount = this.record.get('PostCount');

		if (this.currentPostCount === oldPostCount) {
			this.replyCountEl.update(Ext.util.Format.plural(this.currentPostCount + 1, 'Comment'));
		}
	},

	onDestroy: function () {
		if (Ext.is.iPad) {
			if (this.topicOpen) {
				this.topicOpen = false;
			}
		}

		if (this.bodyEl) {
			this.bodyEl.select('video').each(function (vid) {
				try {
					vid.dom.innerHTML = null;
					vid.dom.load();
				} catch (e) {
					//ignore
				}
			});
		}

		var h = this.record.get('headline');

		if (this.publishStateEl) {
			this.record.removeObserverForField(this, 'published', this.markAsPublished, this);
		}

		if (h) {
			h.removeObserverForField(this, 'title', this.updateField, this);
			h.removeObserverForField(this, 'body', this.updateField, this);
			h.removeObserverForField(this, 'tags', this.updateField, this);
		}

		this.callParent(arguments);
	},

	fireDeleteEvent: function () {
		var me = this;

		me.ForumActions.deleteObject(me.record,me,function (cmp) {
			me.fireEvent('record-deleted', null);
			me.destroy();
			dispatch(Forums.FORUM_TOPIC_CHANGE, { forum: me.forum.getId() });
		});
	},

	destroyWarningMessage: function () {
		return getString('NextThought.view.forums.topic.parts.Topic.destrowarning');
	},

	onDeletePost: function (e) {
		e.stopEvent();
		var me = this;
		Ext.Msg.show({
			msg: me.destroyWarningMessage(),
			//We need to bitwise OR these two, so stop the lint.
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL, //eslint-disable-line no-bitwise
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': getString('NextThought.view.forums.topic.parts.Topic.deletebutton')},
			title: getString('NextThought.view.forums.topic.parts.Topic.deletetitle'),
			fn: function (str) {
				if (str === 'ok') {
					me.fireDeleteEvent();
				}
			}
		});
	},

	onEditPost: function (e) {
		e.stopEvent();
		this.fireEvent('edit-topic', this, this.record, this.forum);
	},

	getRecord: function () {
		return this.record;
	},

	onBeforeDeactivate: function () {
		if (this.bodyEl) {
			this.bodyEl.select('video').each(function (v) {
				v.dom.innerHTML = null;
				v.dom.load();
			});
		}
	},

	onBeforeActivate: function () {
		var href;
		if (this.bodyEl) {
			this.bodyEl.select('video').each(function (v) {
				if (Ext.isEmpty((v.getHTML() || '').trim())) {
					href = v.dom.getAttribute('href');
					Ext.DomHelper.overwrite(v, {
						tag: 'source',
						src: href
					});
				}
			});
		}
	},

	buildCommentPagingNav: function (commentCmp) {
		var me = this;

		this.onceRendered.then(function () {
			me.pagingCommentsNav = Ext.get(me.pagingCommentsNavTpl.append(me.el.down('.foot')));
			me.pager = Ext.widget('topic-comment-pager', {
				renderTo: me.pagingCommentsNav
			});
			me.pager.bindStore(commentCmp.store);

			me.mon(me.pager, {
				'mask-view': function () {
					var commentRect = commentCmp.el && commentCmp.el.dom.getBoundingClientRect(),
						viewHeight = Ext.Element.getViewportHeight(),
						h = viewHeight - commentRect.top;

					h = h < 200 ? 200 : h;

					commentCmp.el.setHeight(h);
					commentCmp.addCls('nti-mask-element');
				},
				'unmask-view': function () {
					commentCmp.el.setHeight('auto');
					commentCmp.removeCls('nti-mask-element');
				}
			});
		});
	},

	setContent: function (html, cb) {
		if (!this.bodyEl || !this.bodyEl.dom) { return; }
		var me = this, cmps;
		this.bodyEl.update(html);
		DomUtils.adjustLinks(this.bodyEl, window.location.href);

		this.bodyEl.select('img.whiteboard-thumbnail').each(function (el) {
			var wrapper = el.up('.body-divider');
			el.replace(wrapper);
		});

		this.bodyEl.select('img').each(function (img) {
			img.on('load', function () {
				me.fireEvent('sync-height');
			});
		});

		this.mon(this.bodyEl, 'click', this.onBodyClick.bind(this));

		if (Ext.isFunction(cb)) {
			cmps = cb(this.bodyEl, this);
			Ext.each(cmps, function (c) {
				me.on('destroy', c.destroy, c);
			});
		}
	},


	onBodyClick: function (e) {
		let el = e.getTarget('.attachment-part'),
			part = this.getAttachmentPart(el);

		if (part  && !e.getTarget('.download')) {
			e.stopEvent();
			if (!this.ContentViewerActions) {
				this.ContentViewerActions = ContentviewerActions.create();
			}

			this.ContentViewerActions.showAttachmentInPreviewMode(part, this.record);
		}
	},


	getAttachmentPart: function (el) {
		let name = el && el.getAttribute && el.getAttribute('name');

		if (!name || !this.record) {
			return null;
		}

		let h = this.record.get('headline'),
			body = h && h.get('body') || [], part;

		body.forEach(function (p) {
			if (p.name === name) {
				part = p;
				return false;
			}
		});

		return part;
	},


	getSearchHitConfig: function () {
		return {
			key: 'forum',
			mainViewId: 'forums'
		};
	},

	getContainerIdForSearch: function () {
		return this.record.get('NTIID');
	},

	onceReadyForSearch: function () {
		return wait();
	},

	/*	NOTE: There was inconsistency scrolling to the right place in the forum view.
	 *	While the parent view( i.e forums view) scrolls, this view doesn't scroll,
	 *	thus we override it to account for the scrolling from the view that scrolls
	 */
	scrollToHit: function (fragment, phrase) {
		var fragRegex = SearchUtils.contentRegexForFragment(fragment, phrase, true),
			searchIn = this.el.dom,
			doc = searchIn.ownerDocument,
			index = this.buildSearchIndex(),
			ranges = TextRangeFinderUtils.findTextRanges(searchIn, doc, fragRegex, undefined, index),
			range, pos = -2, nodeTop, scrollOffset, p;


		if (Ext.isEmpty(ranges)) {
			console.warn('Could not find location of fragment', fragment);
			return;
		}

		if (ranges.length > 1) {
			console.warn('Found multiple hits for fragment.	 Using first', fragment, ranges);
		}
		range = ranges[0];
		p = this.getMainView();

		if (range && range.getClientRects().length > 0) {
			nodeTop = range.getClientRects()[0].top;
			scrollOffset = p.getScroll().top;
			pos = nodeTop + scrollOffset;
		}

		console.log('Need to scroll to calculated pos', pos);
		if (pos > 0) {
			pos -= p.getHeight() / 2;
			if (p) {
				console.log('Scroll To pos: ', pos, 'current scroll: ', scrollOffset, ' view: ', p);
				p.scrollTo('top', pos, true);
			}
		}
	}
});
