const Ext = require('extjs');
const moment = require('moment');

const UserRepository = require('legacy/cache/UserRepository');
const SharingUtils = require('legacy/util/Sharing');

require('./BaseContainer');
require('legacy/mixins/LikeFavoriteActions');
require('legacy/model/resolvers/VideoPosters');
require('legacy/app/windows/Actions');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.tiles.Post', {
	extend: 'NextThought.app.course.dashboard.components.tiles.BaseContainer',

	mixins: {
		likeAndFavoriteActions: 'NextThought.mixins.LikeFavoriteActions'
	},

	getTargetEl: function () {
		return this.body;
	},

	childEls: ['body'],
	getDockedItems: function () { return []; },
	layout: 'none',

	inheritableStatics: {
		WHITEBOARD_SIZE: 300,

		COMMENT_PARAMS: {
			batchSize: 2
		}
	},

	cls: 'dashboard-post',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'location', cn: [
			{cls: 'path', html: '{Path}'},
			{cls: 'current', html: '{Current}'}
		]},
		{cls: 'context'},
		{cls: 'post-body', cn: [
			{cls: 'controls', cn: [
				{ cls: 'favorite-spacer' },
				{ cls: 'favorite' },
				{ cls: 'like' }
			]},
			{cls: 'post-meta', cn: [
				{ cls: 'avatar-wrapper', cn: ['{Creator:avatar}']},
				{ cls: 'meta', cn: [
					{cls: 'name', html: '{Creator:displayName()}'},
					{tag: 'span', cls: 'list-item shared-with', html: '{SharedWith}'},
					{tag: 'span', cls: 'list-item created', html: '{CreatedTime}'}
				]}
			]},
			{cls: 'post', cn: [
				{cls: 'title', html: '{Title}'},
				{cls: 'body', html: '{Body}'},
				{tag: 'span', cls: 'list-item more', html: 'Read More'},
				{tag: 'span', cls: 'list-item comment-count', html: '{CommentCount:plural("Comment")}'}
			]}
		]},
		{ id: '{id}-body', cls: 'body-container', cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'add-comment', html: 'Add a comment'}
	]),

	renderSelectors: {
		locationEl: '.location',
		pathEl: '.location .path',
		currentEl: '.location .current',
		contextEl: '.context',
		liked: '.controls .like',
		favorites: '.controls .favorite',
		avatarEl: '.post-meta .avatar-wrapper',
		nameEl: '.post-meta .name',
		sharedWithEl: '.post-meta .shared-with',
		createdEl: '.post-meta .created',
		titleEl: '.post .title',
		bodyEl: '.post .body',
		moreEl: '.post .more',
		commentCountEl: '.post .comment-count',
		commentsContainerEl: '.body-container',
		addCommentEl: '.add-comment'
	},

	initComponent: function () {
		this.callParent(arguments);

		var me = this;

		if (me.record && me.removeOnDelete) {
			me.mon(me.record, 'deleted', me.onDelete, me);

			this.on('destroy', function () {
				me.record.un('deleted', me.onDelete, me);
			});
		}
	},

	onDelete: function () {
		this.destroy();
	},

	beforeRender: function () {
		this.callParent(arguments);

		var me = this, renderData = {},
			fields = {
				Path: this.getPath(),
				Creator: this.getCreator(),
				SharedWith: this.getSharedWith(),
				CreatedTime: this.getCreatedTime(),
				Title: this.getTitle(),
				Body: this.getBody(),
				CommentCount: this.getCommentCount()
			};

		Ext.Object.each(fields, function (key, value) {
			//if the get* returns a promise what for it to fulfill and call set*
			if (value instanceof Promise) {
				value.then(me.callWhenRendered.bind(me, 'set' + key));
			//else render with that value
			} else {
				renderData[key] = value;
			}
		});

		this.renderData = Ext.apply(this.renderData || {}, renderData);

		this.mixins.likeAndFavoriteActions.constructor.call(this);
	},

	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.getContext()
			.then(me.callWhenRendered.bind(me, 'setContext'));

		if (me.hasComments()) {
			me.showComments();
		}

		this.mon(this.el, 'click', 'itemClicked');
	},

	itemClicked: function (e) {
		if (!e.getTarget('.body-container') && !e.getTarget('.controls') && this.handleNavigation) {
			this.handleNavigation(e);
		}
	},

	callWhenRendered: function (name, value) {
		if (!this.rendered) {
			this.on('afterrender', this[name].bind(this, value));
			return;
		}

		this[name].call(this, value);
	},

	//getters that the sub types should override
	//either return a string to put in the tpl or a Promise
	//that fulfills with a value to call the setter with
	getPath: function () { return ''; },

	getCurrent: function () { return ''; },
	getSharedWith: function () { return ''; },
	getTitle: function () { return ''; },
	getBody: function () { return Promise.resolve(''); },
	getCommentCount: function () { return 0; },
	getContext: function () { return Promise.resolve({}); },

	//this should be the same for all sub instances
	getCreatedTime: function () {
		var created = this.record.get('CreatedTime');

		return moment(created).format('MMM Do h:mm A');
	},

	//this should be the same for all sub instances
	getCreator: function () {
		var rec = this.record,
			creator = rec.get('Creator'),
			me = this;

		if (!Ext.isString(creator)) { return creator; }

		return UserRepository.getUser(creator)
			.then(function (user) {
				rec.set('Creator', user);
				me.mon(user, 'avatarChanged', me.setCreator.bind(me, user));
				return user;
			});
	},

	setPath: function (value) {
		value = Ext.clone(value);
		this.setCurrent(value.shift(), value.length);

		value.reverse();

		this.pathEl.update(value.join(' / '));
	},

	setCurrent: function (value, otherParts) {
		if (value && otherParts) {
			this.pathEl.addCls('has-current');
		}
		this.currentEl.update(value);
	},

	setCreator: function (value) {
		if (!this.rendered) {
			this.on('afterrender', this.setCreator.bind(this, value));
			return;
		}

		var name = value.getName();

		this.nameEl.update(name);
		this.avatarEl.setHTML(Ext.DomHelper.createTemplate('{user:avatar}').apply({user: value}));
	},

	setSharedWith: function (value) {
		var me = this,
			sharingInfo = SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(value));

		SharingUtils.getLongTextFromShareInfo(sharingInfo, null, 2)
			.then(function (text) {
				if (me.sharedWithEl) {
					me.sharedWithEl.update(text);
				}
			});
	},

	setCreatedTime: function (value) {
		this.createdEl.update(value);
	},

	setTitle: function (value) {
		if (this.titleEl) {
			this.titleEl.update(value);
		}
	},

	updateBody: function () {
		this.getBody()
			.then(this.setBody.bind(this));
	},

	setBody: function (value) {
		if (this.bodyEl) {
			this.bodyEl.update(value);
		}
	},

	setCommentCount: function (value) {
		this.commentCountEl.update(Ext.util.Format.plural(value, 'Comment'));
	},

	setContext: function (context) {
		if (Ext.isEmpty(context) || Ext.Object.isEmpty(context)) { return; }

		var me = this,
			show = false,
			cmp;

		if (context.type && this.contextEl) {
			show = true;
			context = Ext.apply(context, {renderTo: this.contextEl, width: me.width});
			cmp = Ext.widget(context);
			me.on('destroy', 'destroy', cmp);
		}

		if (!show && this.contextEl) {
			this.contextEl.setVisibilityMode(Ext.dom.Element.DISPLAY);
			this.contextEl.hide();
		}

		if (!this.CACHE.height) {
			this.CACHE.height = this.height + (show ? 186 : 10);
		}
	},

	showComments: function () {
		this.loadComments()
			.then(this.addComments.bind(this))
			.catch(this.showCommentError.bind(this));
	},

	hasComments: function () {},
	loadComments: function () {},
	getCmpForComment: function () {},

	addComments: function (items) {
		var me = this;

		items = items.slice(0, 2);

		items = (items || []).map(function (item) {
			return me.getCmpForComment(item);
		});

		items.reverse();

		me.add(items);
	},

	showCommentError: function () {}
});
