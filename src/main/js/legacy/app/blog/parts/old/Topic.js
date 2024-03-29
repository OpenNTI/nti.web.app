const Ext = require('@nti/extjs');
const IdCache = require('internal/legacy/cache/IdCache');
const UserRepository = require('internal/legacy/cache/UserRepository');
const DomUtils = require('internal/legacy/util/Dom');
const Globals = require('internal/legacy/util/Globals');
const TextRangeFinderUtils = require('internal/legacy/util/TextRangeFinder');
const SearchUtils = require('internal/legacy/util/Search');
const NTI = require('internal/legacy/store/NTI');
const ContentviewerActions = require('internal/legacy/app/contentviewer/Actions');

require('internal/legacy/common/ux/SearchHits');
require('internal/legacy/editor/Editor');
require('internal/legacy/layout/component/Natural');
require('internal/legacy/mixins/FlagActions');
require('internal/legacy/mixins/LikeFavoriteActions');
require('internal/legacy/mixins/ProfileLinks');
require('./Comment');

module.exports = exports = Ext.define('NextThought.app.blog.parts.old.Topic', {
	extend: 'Ext.container.Container',
	threaded: true,

	mixins: {
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		profileLink: 'NextThought.mixins.ProfileLinks',
	},

	onClassExtended: function (cls, data) {
		data.renderSelectors = Ext.applyIf(
			data.renderSelectors || {},
			cls.superclass.renderSelectors
		);
	},

	cls: 'topic-post list scrollable',
	defaultType: 'forums-topic-comment',
	layout: 'auto',
	commentIdPrefix: 'topic-comment',
	componentLayout: 'natural',
	scrollParentCls: '.forums-view',

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],
	showPermissions: false,

	pathTpl: Ext.DomHelper.markup([
		{
			cls: 'path',
			cn: [
				'{path} / ',
				{ tag: 'span', cls: 'title-part', html: '{title}' },
			],
		},
	]),

	renderTpl: Ext.DomHelper.markup([
		{
			cls: 'wrap',
			cn: [
				{ cls: 'controls', cn: [{ cls: 'favorite' }, { cls: 'like' }] },
				{
					cls: 'avatar',
					style: {
						backgroundImage: 'url({headline.Creator:avatarURL()});',
					},
				},
				{ cls: 'title', html: '{title}' },
				{
					cls: 'meta',
					cn: [
						{
							cls: 'name-wrap',
							cn: [
								{
									tag: 'tpl',
									if: 'showName',
									cn: {
										tag: 'span',
										cls: 'name link',
										html: '{headline.Creator:displayName()}',
									},
								},
								{
									tag: 'span',
									cls: 'datetime',
									html: '{CreatedTime:ago}',
								},
							],
						},
						{
							tag: 'tpl',
							if: 'headline.isModifiable || showPermissions',
							cn: [
								{
									tag: 'span',
									cls: 'state link {publish-state:lowercase}',
									html: '{publish-state}',
								},
							],
						},
						{
							tag: 'tpl',
							if: 'headline.isModifiable',
							cn: [
								{ tag: 'span', cls: 'edit link', html: 'Edit' },
								{
									tag: 'span',
									cls: 'delete link',
									html: 'Delete',
								},
							],
						},
					],
				},
				{ cls: 'body' },
				{
					cls: 'foot',
					cn: [
						{
							tag: 'span',
							cls: 'tags',
							cn: [
								{
									tag: 'tpl',
									for: 'headline.tags',
									cn: [
										{
											tag: 'span',
											cls: 'tag',
											html: '{.}',
										},
									],
								},
							],
						},
						{
							cls: 'comment-box',
							cn: [
								{
									cls: 'response',
									cn: [
										{
											tag: 'span',
											cls: 'post-count',
											html: '{PostCount:plural("Comment")}',
										},
										{
											tag: 'tpl',
											if: 'canReply',
											cn: [
												{
													tag: 'span',
													cls: 'reply link',
													html: 'Add a Comment',
												},
											],
										},
										{
											tag: 'span',
											cls: 'report link',
											html: 'Report',
										},
									],
								},
							],
						},
					],
				},
			],
		},
		{ cls: 'load-more', html: 'more comments' },
		{
			id: '{id}-body',
			cls: 'comment-container',
			cn: ['{%this.renderContainer(out,values)%}'],
		},
		{ cls: 'editor-box' },
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
		postCountEl: '.comment-box .post-count',
		responseEl: '.comment-box .response',
		replyLinkEl: '.comment-box .response .reply',
		reportLinkEl: '.comment-box .response .report',
		commentEditorBox: '.editor-box',
		loadMoreEl: '.load-more',
		commentContainerEl: '.comment-container',
	},

	constructor: function () {
		this.callParent(arguments);
		if (!this.topicListStore || this.currentIndex === undefined) {
			this.noNavArrows = true;

			if ($AppConfig.debug) {
				Ext.Error.raise(
					'Not given the topic list store or current index, cant implment the navigation arrows'
				);
			}
		}
	},

	initComponent: function () {
		this.callParent(arguments);
		this.addEvents(['delete-post', 'show-post', 'ready', 'commentReady']);
		this.enableBubble(['delete-post', 'show-post']);
		this.on('ready', this.onReady, this);
		this.mon(this.record, 'destroy', this.destroy, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.on('beforeactivate', this.onBeforeActivate, this);

		if (this.threaded) {
			this.add({ xtype: 'forum-comment-thread', topic: this.record });
		} else {
			this.initialLoad = new Promise(this.buildStore.bind(this));
		}
	},

	buildStore: function (fulfill, reject) {
		var s = NTI.create({
			storeId:
				this.getRecord().get('Class') +
				'-' +
				this.getRecord().get('NTIID'),
			url: this.getRecord().getLink('contents'),
			pageSize: 10,
		});

		s.proxy.extraParams = Ext.apply(s.proxy.extraParams || {}, {
			sortOn: 'CreatedTime',
			sortOrder: 'descending',
		});

		this.store = s;

		this.mon(this.store, {
			scope: this,
			add: this.addComments,
			load: (store, records) => {
				this.loadComments(store, records);
				fulfill();
			},
		});

		this.store.load();
	},

	setPath: function () {},

	beforeRender: function () {
		this.callParent(arguments);
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.mixins.flagActions.constructor.call(this);

		var me = this,
			r = this.record; //,s;

		if (!r || !r.getData) {
			Ext.defer(this.destroy, 1, this);
			return;
		}
		//s = r.getPublishState();
		r = this.renderData = Ext.apply(this.renderData || {}, r.getData());
		Ext.apply(r, {
			path: this.path,
			showName: true,
			headerCls: 'forum-topic',
			canReply: this.canReply(),
		});

		me.setPath();

		if (!r.headline || !r.headline.getData) {
			console.warn(
				'The record does not have a story field or it does not implement getData()',
				r
			);

			Ext.defer(this.destroy, 1, this);
			return;
		}
		r.headline = r.headline.getData();

		UserRepository.getUser(r.headline.Creator, function (u) {
			r.headline.Creator = u;
			me.user = u;
			if (me.rendered) {
				me.nameEl.update(u.getName());
				me.avatarEl.setStyle({
					backgroundImage: 'url(' + u.get('avatarURL') + ')',
				});
			}
		});
	},

	afterRender: function () {
		console.log('RENDERED TOPIC');
		if (Ext.is.iPad) {
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

		this.scrollParent =
			this.el.parent(this.scrollParentCls) ||
			this.el.parent('.course-forum');

		//TODO: move this into a mixin so we can share it in the other post widgets (and forum post items)
		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);

		if (this.threaded) {
			this.loadMoreEl.destroy();
		} else {
			this.mon(this.loadMoreEl, 'click', this.fetchNextPage, this);
		}

		if (this.user) {
			this.nameEl.update(this.user.getName());
			this.avatarEl.setStyle({
				backgroundImage: 'url(' + this.user.get('avatarURL') + ')',
			});
		}

		this.updateRecord(this.record);

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

			this.editor = Ext.widget('nti-editor', {
				ownerCt: this,
				renderTo: this.commentEditorBox,
				enableFileUpload: true,
				enableVideo: true,
			});
			this.mon(this.replyLinkEl, 'click', this.showEditor, this);
			this.mon(this.editor, {
				scope: this,
				//'activated-editor':Ext.bind(box.hide,box),
				//'deactivated-editor':Ext.bind(box.show,box),
				'no-body-content': function (editor, bodyEl) {
					editor.markError(bodyEl, 'You need to type something');
					return false;
				},
				save: this.saveComment.bind(this),
			});
		}
	},

	canReply: function () {
		return Boolean(this.record && this.record.getLink('add'));
	},

	setPublishAndSharingState: function () {},

	scrollCommentIntoView: function (commentId) {
		const scrollIntoView = () => {
			const cmp = Ext.get('forums') || Ext.get('course-forum');
			const el = Ext.isBoolean(commentId)
				? this.getTargetEl()
				: this.el.down('[data-commentid="' + commentId + '"]');

			if (el) {
				Ext.defer(el.scrollIntoView, 500, el, [
					cmp.dom,
					false,
					Globals.ANIMATE_NO_FLASH,
				]);
			}
		};

		if (commentId) {
			const images = this.el.query('img');
			Ext.each(images, function (img) {
				img.onload = function () {
					scrollIntoView();
				};
			});
			scrollIntoView();
		} else {
			const f = Ext.get('forums');
			if (f) {
				f.scrollTo('top', 0, true);
			}
		}
	},

	onReady: function () {
		console.debug('ready', arguments);

		if (this.scrollToComment) {
			this.scrollCommentIntoView(this.scrollToComment);
		}

		this.fireEvent('highlight-ready');
	},

	markAsPublished: function (key, value) {
		var val = value ? 'public' : 'only me',
			removeCls = value ? 'only me' : 'public';
		this.publishStateEl.addCls(val);
		this.publishStateEl.update(
			Ext.Array.map(val.split(' '), Ext.String.capitalize).join(' ')
		);
		this.publishStateEl.removeCls(removeCls);
	},

	updateRecord: function (record) {},

	navigationClick: function (e) {
		e.stopEvent();

		var direction = Boolean(e.getTarget('.next')),
			rec,
			disabled = Boolean(e.getTarget('.disabled'));

		if (!disabled) {
			if (direction && this.nextRecord) {
				rec = this.nextRecord;
			}

			if (!direction && this.prevRecord) {
				rec = this.prevRecord;
			}

			if (rec) {
				this.fireEvent('navigate-topic', this, rec);
				this.destroy();
			} else {
				console.error(
					'Dont have the next or prev topic to navigate to'
				);
			}
		}

		return false;
	},

	getRefItems: function () {
		var ret = this.callParent(arguments) || [];
		if (this.editor) {
			ret.push(this.editor);
		}
		return ret;
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

	showEditor: function () {
		if (this.threaded) {
			this.down('forum-comment-thread').addRootReply();
			return;
		}

		this.clearSearchHit();
		if (!this.editor.isActive()) {
			this.editor.reset();
			this.editor.activate();
		}
		this.editor.focus(true);
		this.getMainView().scrollChildIntoView(this.editor.getEl());
	},

	saveComment: function () {},

	updateField: function (key, value) {
		var el = this.el.down('.' + key);
		if (el) {
			el.update(value);
		}
	},

	updateContent: function () {
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData, {
			'application/vnd.nextthought.embeddedvideo': 640,
		});
	},

	closeView: function () {
		this.fireEvent('pop-view', this);
	},

	onDestroy: function () {
		console.log('destroy!');

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
					//don't care?
				}
			});
		}

		if (this.editor) {
			delete this.editor.ownerCt;
			this.editor.destroy();
		}
		var h = this.record.get('headline');

		if (this.publishStateEl) {
			this.record.removeObserverForField(
				this,
				'published',
				this.markAsPublished,
				this
			);
		}

		if (h) {
			h.removeObserverForField(this, 'title', this.updateField, this);
			h.removeObserverForField(this, 'body', this.updateField, this);
			h.removeObserverForField(this, 'tags', this.updateField, this);
		}
		if (this.store) {
			this.store.destroyStore();
		}

		this.callParent(arguments);
	},

	fireDeleteEvent: function () {
		this.fireEvent('delete-post', this.record, this);
	},

	destroyWarningMessage: function () {
		return 'Deleting your topic will permanently remove it and any comments.';
	},

	onDeletePost: function (e) {
		e.stopEvent();
		var me = this;

		Ext.Msg.show({
			msg: me.destroyWarningMessage(),
			//We need to bitwise OR these two, so stop the lint.
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: { ok: 'Delete' },
			title: 'Are you sure?',
			fn: function (str) {
				if (str === 'ok') {
					me.fireDeleteEvent();
				}
			},
		});
	},

	onEditPost: function (e) {
		console.log('onEditPost');
		e.stopEvent();
		this.fireEvent('edit-topic', this, this.record);
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
						src: href,
					});
				}
			});
		}
	},

	setContent: function (html, cb) {
		if (!this.bodyEl || !this.bodyEl.dom) {
			return;
		}

		var me = this,
			cmps;

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

		if (part && !e.getTarget('.download')) {
			e.stopEvent();
			if (!this.ContentViewerActions) {
				this.ContentViewerActions = ContentviewerActions.create();
			}

			this.ContentViewerActions.showAttachmentInPreviewMode(
				part,
				this.record
			);
		}
	},

	getAttachmentPart: function (el) {
		let name = el && el.getAttribute && el.getAttribute('name');

		if (!name || !this.record) {
			return null;
		}

		let h = this.record.get('headline'),
			body = (h && h.get('body')) || [],
			part;

		body.forEach(function (p) {
			if (p.name === name) {
				part = p;
				return false;
			}
		});

		return part;
	},

	fetchNextPage: function () {
		var s = this.store,
			max;

		if (!s.hasOwnProperty('data')) {
			return;
		}

		max = s.getPageFromRecordIndex(s.getTotalCount() - 1);
		if (s.currentPage < max && !s.isLoading()) {
			s.clearOnPageLoad = false;
			s.nextPage();
		}
	},

	addComments: function (store, records) {
		var prefix = this.commentIdPrefix;
		if (!Ext.isEmpty(records)) {
			//Umm it renders sorted ASC but we pass DESC
			records = Ext.Array.sort(
				records,
				Globals.SortModelsBy('CreatedTime', 'DESC')
			);
			this.add(
				Ext.Array.map(records, function (r) {
					var guid = IdCache.getComponentId(r, null, prefix);

					return { record: r, id: guid };
				})
			);
		}
	},

	loadComments: function (store, records) {
		if (!this.rendered) {
			this.on(
				'afterrender',
				Ext.bind(this.loadComments, this, arguments),
				this
			);
			return;
		}

		var me = this,
			left = store.getTotalCount() - store.getCount(),
			max = store.getPageFromRecordIndex(store.getTotalCount() - 1);

		if (store.currentPage === max || me.store.getTotalCount() === 0) {
			//there is nothing more to load
			this.loadMoreEl.remove();
			this.commentContainerEl.addCls('no-more');
		}

		this.loadMoreEl.update(
			Ext.util.Format.plural(Math.min(left, 10), 'more comment')
		);

		records = Ext.Array.sort(
			records,
			Globals.SortModelsBy('CreatedTime', 'DESC')
		);

		Ext.each(records, function (item, index) {
			var guid = IdCache.getComponentId(item, null, me.commentIdPrefix);

			if (me.getComponent(guid)) {
				//We might want to update the item, instead of just dropping it.
				console.log('Record already exists.');
			} else {
				me.insert(index, { record: item, id: guid });
			}
		});
		//	this.add(Ext.Array.map(records, function (r) {
		//		return {record: r};
		//	}));

		this.ready = true;
		Ext.defer(this.fireEvent, 1, this, ['ready', this, this.queryObject]);
	},

	addIncomingComment: function (item) {
		if (
			item.get('ContainerId') === this.record.getId() &&
			Globals.isMe(this.record.get('Creator'))
		) {
			this.addComments(this.store, [item]);

			//Adding a comment in this way doesn't trigger updating the containerView, so we will update the record ourselves.
			this.record.set({ PostCount: this.store.getCount() + 1 });
		}
	},

	goToComment: function (comment) {
		var thread;

		if (this.threaded) {
			thread = this.down('forum-comment-thread');

			if (thread) {
				thread.goToComment(comment);
			}
			return;
		}

		comment = comment.get('ID');

		if (!this.ready) {
			this.scrollToComment = comment;
			return;
		}

		if (comment) {
			this.scrollCommentIntoView(comment);
			this.fireEvent('commentReady');
		} else {
			this.scrollCommentIntoView(null);
		}
	},

	getSearchHitConfig: function () {
		return {
			key: 'forum',
			mainViewId: 'forums',
		};
	},

	/*	NOTE: There was inconsistency scrolling to the right place in the forum view.
	 *	While the parent view( i.e forums view) scrolls, this view doesn't scroll,
	 *	thus we override it to account for the scrolling from the view that scrolls
	 */
	scrollToHit: function (fragment, phrase) {
		var fragRegex = SearchUtils.contentRegexForFragment(
				fragment,
				phrase,
				true
			),
			searchIn = this.el.dom,
			doc = searchIn.ownerDocument,
			index = this.buildSearchIndex(),
			ranges = TextRangeFinderUtils.findTextRanges(
				searchIn,
				doc,
				fragRegex,
				undefined,
				index
			),
			range,
			pos = -2,
			nodeTop,
			scrollOffset,
			p;

		if (Ext.isEmpty(ranges)) {
			console.warn('Could not find location of fragment', fragment);
			return;
		}

		if (ranges.length > 1) {
			console.warn(
				'Found multiple hits for fragment.	 Using first',
				fragment,
				ranges
			);
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
				console.log(
					'Scroll To pos: ',
					pos,
					'current scroll: ',
					scrollOffset,
					' view: ',
					p
				);
				p.scrollTo('top', pos, true);
			}
		}
	},
});
