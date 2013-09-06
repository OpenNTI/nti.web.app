Ext.define('NextThought.view.forums.Topic', {
	extend: 'Ext.container.Container',
	alias: 'widget.forums-topic',

	mixins: {
		flagActions: 'NextThought.mixins.FlagActions',
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions',
		profileLink: 'NextThought.mixins.ProfileLinks',
		searchHitHighlighting: 'NextThought.mixins.SearchHitHighlighting',
		HeaderLock: 'NextThought.view.forums.mixins.HeaderLock'
	},

	requires: [
		'NextThought.editor.Editor',
		'NextThought.view.forums.Comment',
		'NextThought.view.menus.BlogTogglePublish',
		'NextThought.ux.SearchHits',
		'NextThought.layout.component.Natural'
	],

	onClassExtended: function (cls, data) {
		data.renderSelectors = Ext.applyIf(data.renderSelectors || {}, cls.superclass.renderSelectors);
	},

	cls: 'topic-post list scrollable',
	defaultType: 'forums-topic-comment',
	layout: 'auto',
	componentLayout: 'natural',

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],

	showPermissions: false,

	pathTpl: Ext.DomHelper.markup([
		{cls: 'path', cn: ['{path} / ', {tag: 'span', cls: 'title-part', html: '{title}'}]}
	]),

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'header-container', cn: { cls: '{headerCls} navigation-bar', cn: [
			{cls: 'pager', cn: [
				{cls: 'prev disabled'},
				{cls: 'next disabled'}
			]}
		]}},
		{ cls: 'wrap', cn: [
			{ cls: 'controls', cn: [
				{cls: 'favorite'},
				{cls: 'like'}
			]},
			{ cls: 'title', html: '{title}' },
			{ cls: 'meta', cn: [
				{ tag: 'tpl', 'if': 'showName', cn: { tag: 'span', cls: 'name link', html: '{headline.Creator}'}},
				{ tag: 'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:i A")}'},
				{ tag: 'tpl', 'if': 'headline.isModifiable || showPermissions', cn: [
					{ tag: 'span', cls: 'state link {publish-state:lowercase}', html: '{publish-state}'}
				]},
				{ tag: 'tpl', 'if': 'headline.isModifiable', cn: [
					{ tag: 'span', cls: 'edit link', html: 'Edit'},
					{ tag: 'span', cls: 'delete link', html: 'Delete'}
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
						{ tag: 'tpl', 'if':'canReply', cn: [
							{ tag: 'span', cls: 'reply link', html: 'Add a Comment' }
						]},
						{ tag: 'span', cls: 'report link', html: 'Report' }
					]},
					{ cls: 'editor-box'}
				]}
			]}
		]},
		{ id: '{id}-body', cls: 'comment-container',
			cn: ['{%this.renderContainer(out,values)%}'] }
	]),


	renderSelectors: {
		bodyEl: '.body',
		nameEl: '.meta .name',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		flagEl: '.report.link',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		commentBoxEl: '.comment-box',
		responseEl: '.comment-box .response',
		replyLinkEl: '.comment-box .response .reply',
		reportLinkEl: '.comment-box .response .report',
		commentEditorBox: '.comment-box .editor-box',
		headerElContainer: '.header-container',
		headerEl: '.navigation-bar',
		nextPostEl: '.navigation-bar .next',
		prevPostEl: '.navigation-bar .prev'
	},


	initComponent: function () {
		this.mixins.HeaderLock.constructor.call(this);
		this.callParent(arguments);
		this.addEvents(['delete-post', 'show-post', 'ready', 'commentReady']);
		this.enableBubble(['delete-post', 'show-post']);
		this.on('ready', this.onReady, this);
		this.mon(this.record, 'destroy', this.destroy, this);
		this.on('beforedeactivate', this.onBeforeDeactivate, this);
		this.on('beforeactivate', this.onBeforeActivate, this);
		this.buildStore();
	},


	buildStore: function () {
		this.store = NextThought.store.NTI.create({
			storeId: this.getRecord().get('Class') + '-' + this.getRecord().get('NTIID'),
			url: this.getRecord().getLink('contents')
		});

		this.mon(this.store, {
			scope: this,
			add: this.addComments,
			load: this.loadComments
		});

		this.store.load();
	},


	setPath: function () {
		var me = this,
			containerId = this.record.get('ContainerId');

		function success(r) {
			var forumTitle = r.get('title'),
				topicTitle = me.record.get('title'), tpl;

			if (me.rendered) {
				tpl = new Ext.XTemplate(me.pathTpl);
				tpl.insertFirst(me.headerEl, {path: forumTitle, title: topicTitle}, true);
			}
		}

		function fail() {
			console.log('there was an error retrieving the object.', arguments);
		}

		$AppConfig.service.getObject(containerId, success, fail, me);
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
			path: this.path,
			showName: true,
			headerCls: 'forum-topic',
			canReply: this.canReply()
		});

		me.setPath();

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
			}
		});
	},


	afterRender: function () {
		console.log("RENDERED TOPIC");
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

		//TODO: move this into a mixin so we can share it in the other post widgets (and forum post items)
		h.addObserverForField(this, 'title', this.updateField, this);
		h.addObserverForField(this, 'tags', this.updateField, this);
		h.addObserverForField(this, 'body', this.updateContent, this);

		this.mon(this.headerEl, 'click', this.closeView, this);

		this.mon(this.nextPostEl, 'click', this.navigationClick, this);
		this.mon(this.prevPostEl, 'click', this.navigationClick, this);

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

		if(this.replyLinkEl){
			box.setVisibilityMode(Ext.dom.Element.DISPLAY);

			this.editor = Ext.widget('nti-editor',{ownerCt: this, renderTo:this.commentEditorBox});
			this.mon(this.replyLinkEl,'click',this.showEditor,this);
			this.mon(this.editor,{
				scope: this,
				'activated-editor':Ext.bind(box.hide,box),
				'deactivated-editor':Ext.bind(box.show,box),
				'no-body-content': function(editor,bodyEl){
					editor.markError(bodyEl,'You need to type something');
					return false;
				}
			});
		}
	},

	canReply: function(){
		return Boolean(this.record && this.record.getLink('add'));
	},


	setPublishAndSharingState: function(){},


	scrollCommentIntoView: function (commentId) {
		function scrollIntoView() {
			if (Ext.isBoolean(commentId)) {
				el = me.getTargetEl();
			}
			else {
				el = me.el.down('[data-commentid="' + commentId + '"]');
			}

			if (el) {
				Ext.defer(el.scrollIntoView, 500, el, [Ext.get('forums'), false, Globals.ANIMATE_NO_FLASH]);
			}
		}

		var el, images, me = this, f;
		if (commentId) {
			images = this.el.query('img');
			Ext.each(images, function (img) {
				img.onload = function () {
					scrollIntoView();
				};
			});
			scrollIntoView();
		}
		else {
			f = Ext.get('forums');
			if (f) {
				f.scrollTo('top', 0, true);
			}
		}
	},


	onReady: function () {
		console.debug('ready', arguments);
		if (this.scrollToComment) {
			this.scrollCommentIntoView(this.scrollToComment);
			this.fireEvent('commentReady');
		}
	},


	markAsPublished: function (key, value) {
		var val = value ? 'public' : 'only me',
			removeCls = value ? 'only me' : 'public';
		this.publishStateEl.addCls(val);
		this.publishStateEl.update(Ext.Array.map(val.split(' '), Ext.String.capitalize).join(' '));
		this.publishStateEl.removeCls(removeCls);
	},


	updateRecord: function (record) {
		function reflectPrevAndNext(cmp, s) {
			if (!s) {
				return;
			}

			var max = s.getCount() - 1,
				idx = s.find('NTIID', record.get('NTIID'));

			//NOTE: the particular the record and its copy in the store may be different.
			if (!record.store) {
				record.store = s;
			}

			if (idx > 0) {
				cmp.nextPostEl.removeCls('disabled');
			}

			if (idx < max) {
				cmp.prevPostEl.removeCls('disabled');
			}
		}

		if (!record.store) {
			this.fireEvent('topic-navigation-store', this, this.record, reflectPrevAndNext);
		} else {
			console.log('update next and prev...with store', record.store);
			reflectPrevAndNext(this, record.store);
		}
	},


	navigationClick: function (e) {
		e.stopEvent();
		var direction = Boolean(e.getTarget('.next')),
			disabled = Boolean(e.getTarget('.disabled'));

		if (!disabled) {
			this.fireEvent('navigate-topic', this, this.record, direction ? 'next' : 'prev');
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
		this.clearSearchHit();
		this.editor.reset();
		this.editor.activate();
		this.editor.focus(true);
		this.getMainView().scrollChildIntoView(this.editor.getEl());
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

		if(this.bodyEl){
			this.bodyEl.select('video').each(function (vid) {
				try {
					vid.dom.innerHTML = null;
					vid.dom.load();
				} catch (e) {
				}
			});
		}

		if(this.editor){
			delete this.editor.ownerCt;
			this.editor.destroy();
		}
		var h = this.record.get('headline');

		if (this.publishStateEl) {
			this.record.removeObserverForField(this, 'published', this.markAsPublished, this);
		}

		if(h){
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
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: me.destroyWarningMessage(),
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function (str) {
				if (str === 'ok') {
					me.fireDeleteEvent();
				}
			}
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
						src: href
					});
				}
			});
		}
	},


	setContent: function (html, cb) {
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

		if (Ext.isFunction(cb)) {
			cmps = cb(this.bodyEl, this);
			Ext.each(cmps, function (c) {
				me.on('destroy', c.destroy, c);
			});
		}
	},


	addComments: function (store, records) {
		if (!Ext.isEmpty(records)) {
			//Umm it renders sorted ASC but we pass DESC
			records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime', 'DESC'));
			this.add(Ext.Array.map(records, function (r) {
				return {record: r};
			}));
		}
	},


	loadComments: function (store, records) {
		this.removeAll(true);
		records = Ext.Array.sort(records, Globals.SortModelsBy('CreatedTime', 'DESC'));
		this.add(Ext.Array.map(records, function (r) {
			return {record: r};
		}));

		this.ready = true;
		Ext.defer(this.fireEvent, 1, this, ['ready', this, this.queryObject]);
	},


	addIncomingComment: function (item) {
		if (item.get('ContainerId') === this.record.getId() && isMe(this.record.get('Creator'))) {
			this.addComments(this.store, [item]);

			//Adding a comment in this way doesn't trigger updating the containerView, so we will update the record ourselves.
			this.record.set({'PostCount': (this.store.getCount() + 1)});
		}
	},


	goToComment: function (commentId) {
		if (!this.ready) {
			this.scrollToComment = commentId;
			return;
		}

		if (commentId) {
			this.scrollCommentIntoView(commentId);
			this.fireEvent('commentReady');
		}
		else {
			this.scrollCommentIntoView(null);
		}
	},


	getSearchHitConfig: function () {
		return {
			key: 'forum',
			mainViewId: 'forums'
		};
	},


	/*  NOTE: There was inconsistency scrolling to the right place in the forum view.
	 *  While the parent view( i.e forums view) scrolls, this view doesn't scroll,
	 *  thus we override it to account for the scrolling from the view that scrolls
	 */
	scrollToHit: function (fragment, phrase) {
		var fragRegex = SearchUtils.contentRegexForFragment(fragment, phrase, true),
			searchIn = this.el.dom,
			doc = searchIn.ownerDocument,
			index = this.buildSearchIndex(),
			ranges = TextRangeFinderUtils.findTextRanges(searchIn, doc, fragRegex.re, fragRegex.matchingGroups, index),
			range, pos = -2, nodeTop, scrollOffset, p;


		if (Ext.isEmpty(ranges)) {
			console.warn('Could not find location of fragment', fragment);
			return;
		}

		if (ranges.length > 1) {
			console.warn('Found multiple hits for fragment.  Using first', fragment, ranges);
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
