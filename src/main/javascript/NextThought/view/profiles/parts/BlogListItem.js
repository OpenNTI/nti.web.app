Ext.define('NextThought.view.profiles.parts.BlogListItem', {
	extend: 'Ext.Component',
	alias: 'widget.profile-blog-list-item',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	cls: 'entry list-item',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'controls', cn: [{cls: 'favorite'},{cls: 'like'}]},
		{ cls: 'title', html: '{title}' },
		{ cls: 'meta', cn: [
			{ tag: 'span', cls: 'datetime', html: '{CreatedTime:date("F j, Y")} at {CreatedTime:date("g:i A")}'},
			{ tag: 'span', cls: 'state link', html: '{publish-state}'},
			{ tag: 'tpl', 'if': 'headline.isModifiable', cn: [
				{ tag: 'span', cls: 'edit link', html: 'Edit'},
				{ tag: 'span', cls: 'delete link', html: 'Delete'}
			]}//flag?
		]},
		{ cls: 'body' },
		{ cls: 'foot', cn: [
			{ tag: 'span', cls: 'comment-count', html: '{PostCount} Comment{[values.PostCount===1 ? "" : "s"]}' },
			{ tag: 'span', cls: 'tags', cn: [
				{tag: 'tpl', 'for': 'headline.tags', cn: [
					{tag: 'span', cls: 'tag', html: '{.}'}
				]}
			]}
		]}
	]),


	tagTpl: new Ext.XTemplate(Ext.DomHelper.markup({
		tag: 'tpl', 'for': '.', cn: [{tag: 'span', cls: 'tag', html: '{.}'}]})),


	ellipsis: Ext.DomHelper.markup({cls: 'ellipsis', cn: [{},{},{}]}),

	moreTpl: Ext.DomHelper.createTemplate({cn: {tag: 'a', cls: 'more', html: 'Read More', href: '#'}}),


	renderSelectors: {
		bodyEl: '.body',
		titleEl: '.title',
		commentsEl: '.comment-count',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		editEl: '.meta .edit',
		deleteEl: '.meta .delete',
		publishStateEl: '.meta .state'
	},


	initComponent: function() {
		this.headlineObservers = [];
		this.mixins.likeAndFavoriteActions.constructor.call(this);
		this.callParent(arguments);
		this.addEvents(['delete-post', 'show-post']);
		this.enableBubble(['delete-post', 'show-post']);
		this.mon(this.record, 'destroy', this.destroy, this);
	},


	beforeRender: function() {
		this.callParent(arguments);
		var r = this.record;
		if (!r || !r.getData) {
			Ext.defer(this.destroy, 1, this);
			return;
		}

		this.renderData = Ext.apply(this.renderData || {}, r.getData());
		r = this.renderData;
		if (!r.headline || !r.headline.getData) {
			console.warn('The record does not have a story field or it does not implement getData()', r);

			Ext.defer(this.destroy, 1, this);
			return;
		}
		r.headline = r.headline.getData();
		r.headline.tags = Ext.Array.filter(r.headline.tags, function(t) {
			return !ParseUtils.isNTIID(t);
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.bodyEl.selectable();

		this.updateHeadlineObject();

		this.record.addObserverForField(this, 'headline', 'updateHeadlineObject', this);
		this.record.addObserverForField(this, 'PostCount', 'updatePostCount', this);
		this.record.addObserverForField(this, 'sharedWith', 'updateSharedWith', this);

		this.mon(this.titleEl, 'click', 'goToPost');
		this.mon(this.commentsEl, 'click', 'goToPostComments');
		this.updateContent();

		if (this.deleteEl) {
			this.mon(this.deleteEl, 'click', this.onDeletePost, this);
		}

		if (this.editEl) {
			this.mon(this.editEl, 'click', this.onEditPost, this);
		}

		if (this.publishStateEl) {
			this.setPublishAndSharingState();
		}

		this.reflectLikeAndFavorite(this.record);
		this.listenForLikeAndFavoriteChanges(this.record);
	},


	updateHeadlineObject: function() {
		Ext.destroy(this.headlineObservers);
		var h = this.record.get('headline'),
			o = this.headlineObservers = [];

		if (!h) {return;}

		o.push(
			h.addObserverForField(this, 'title', 'updateField'),
			h.addObserverForField(this, 'tags', 'updateField'),
			h.addObserverForField(this, 'body', 'updateContent'),
			h.addObserverForField(this, 'tags', 'setPublishAndSharingState')
		);
	},


	updateField: function(key, value) {
		var el = this.el.down('.' + key), len;
		if (el) {
			if (Ext.isArray(value) && key === 'tags') {
				len = value.length;
				value = Ext.Array.filter(value, function(v) {
					return !ParseUtils.isNTIID(v);
				});

				if (len !== value.length) {
					this.setPublishAndSharingState();
				}

				el.update(this.tagTpl.apply(value));
				return;
			}
			el.update(value);
		}
	},


	updateContent: function() {
		var h = this.record.get('headline');
		h.compileBodyContent(this.setContent, this, this.mapWhiteboardData, {'application/vnd.nextthought.embeddedvideo' : 640});
	},


	updatePostCount: function(k, v) {
		var el = this.el.down('.comment-count');
		if (el) {
			el.update(Ext.String.format('{0} Comment{1}', v, v === 1 ? '' : 's'));
		}
	},


	setPublishAndSharingState: function() {
		this.updateSharedWith('sharedWith', this.record.get('sharedWith'));
	},


	updateSharedWith: function(field, value) {
		var sharingInfo, tags, el = this.publishStateEl,
			published = this.record.isPublished();

		if (field === 'sharedWith') {
			sharingInfo = value;
			tags = this.record.get('headline').get('tags');
		} else if (field === 'tags') {
			sharingInfo = this.record.get('sharedWith');
			tags = value;
		} else {
			sharingInfo = this.record.get('sharedWith');
			tags = this.record.get('headline').get('tags');
		}

		SharingUtils.getTagSharingShortText(sharingInfo, tags, published, function(str) {
			if (el && el.dom) {
				el.update(str);
			}
		}, this);
		SharingUtils.getTagSharingLongText(sharingInfo, tags, published, function(str) {
			if (el && el.dom) {
				el.set({'data-qtip': str});
			}
		}, this);

		el[published ? 'removeCls' : 'addCls']('private');
	},



	onDeletePost: function(e) {
		e.stopEvent();
		var me = this;
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		Ext.Msg.show({
			msg: 'Deleting your thought will permanently remove it and any comments.',
			buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
			scope: me,
			icon: 'warning-red',
			buttonText: {'ok': 'Delete'},
			title: 'Are you sure?',
			fn: function(str) {
				if (str === 'ok') {
					me.fireEvent('delete-post', me.record, me);
				}
			}
		});
	},


	onEditPost: function(e) {
		e.stopEvent();
		this.fireEvent('show-post', this.record.get('ID'), 'edit');
	},


	getRecord: function() {
		return this.record;
	},


	setContent: function(html, cb) {
		var snip = ContentUtils.getHTMLSnippet(html, 300), cmps, me = this;

		if (!this.bodyEl || this.isDestroyed) { return; }

		if (snip) {
			//add ellipsis if there is a snip AND there is a closing tag, otherwise just use the Read More
			snip = snip.replace(/(<\/[^<>]+>)$/, this.ellipsis + '$1');
		}

		this.bodyEl.update((snip || html));
		if (snip) {
			this.moreTpl.append(this.bodyEl, null, true);
			this.mon(this.bodyEl.down('a.more'), 'click', this.goToPost, this);
		}

		DomUtils.adjustLinks(this.bodyEl, window.location.href);

		this.bodyEl.select('img.whiteboard-thumbnail').each(function(el) {
			var wrapper = el.up('.body-divider');
			el.replace(wrapper);
		});

		if (Ext.isFunction(cb)) {
			cmps = cb(this.bodyEl, this);
			Ext.each(cmps, function(c) {me.on('destroy', c.destroy, c);});
		}
	},


	mapWhiteboardData: function() {},


	goToPost: function(e) {
		e.stopEvent();
		this.fireEvent('show-post', this.record.get('ID'));
	},


	goToPostComments: function(e) {
		e.stopEvent();
		this.fireEvent('show-post', this.record.get('ID'), 'comments');
	}
});
