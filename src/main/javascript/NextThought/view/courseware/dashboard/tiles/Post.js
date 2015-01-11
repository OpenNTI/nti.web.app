Ext.define('NextThought.view.courseware.dashboard.tiles.Post', {
	extend: 'NextThought.view.courseware.dashboard.tiles.BaseContainer',

	mixins: ['NextThought.mixins.LikeFavoriteActions'],

	getTargetEl: function() {
		return this.body;
	},

	childEls: ['body'],
	getDockedItems: function() { return []; },

	layout: 'none',

	inheritableStatics: {
		WHITEBOARD_SIZE: 300
	},


	cls: 'dashboard-post',

	renderTpl: Ext.DomHelper.markup([
		{cls: 'location', cn: [
			{cls: 'path', html: '{Path}'},
			{cls: 'current', html: '{Current}'}
		]},
		{cls: 'context-image', cn: [
			{tag: 'img', cls: 'image'},
			{cls: 'title'}
		]},
		{cls: 'post-body', cn: [
			{cls: 'controls', cn: [
				{ cls: 'favorite-spacer' },
				{ cls: 'favorite' },
				{ cls: 'like' }
			]},
			{cls: 'post-meta', cn: [
				{ cls: 'avatar', style: {backgroundImage: 'url({Creator:avatarURL()})'}},
				{ cls: 'meta', cn: [
					{cls: 'name', html: '{Creator:displayName()}'},
					{tag: 'span', cls: 'list-item shared-with', html: '{SharedWith}'},
					{tag: 'span', cls: 'list-item created', html: '{CreatedTime}'}
				]}
			]},
			{cls: 'post', cn: [
				{cls: 'title', html: '{Title}'},
				{cls: 'body', html: '{Body}'},
				{tag: 'span list-item more', html: 'Read More'},
				{tag: 'span list-item comment-count', html: '{CommentCount:plural("Comment")}'}
			]}
		]},
		{ id: '{id}-body', cls: 'body-container', cn: ['{%this.renderContainer(out,values)%}'] },
		{cls: 'add-comment', html: 'Add a comment'}
	]),

	renderSelectors: {
		locationEl: '.location',
		pathEl: '.location .path',
		currentEl: '.location .current',
		contextEl: '.context-image',
		contextImageEl: '.context-image .image',
		contextTitleEl: '.context-image .title',
		liked: '.controls .liked',
		favorites: '.controls .favorite',
		avatarEl: '.post-meta .avatar',
		nameEl: '.post-meta .name',
		sharedWithEl: '.post-meta .shared-with',
		createdEl: '.post-meta .created',
		titleEl: '.post .title',
		bodyEl: '.post .body',
		moreEl: '.post .more',
		commentCountEl: '.post .comment-count',
		commentsContianerEl: '.body-container',
		addCommentEl: '.add-comment'
	},

	beforeRender: function() {
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

		Ext.Object.each(fields, function(key, value) {
			//if the get* returns a promise what for it to fulfill and call set*
			if (value instanceof Promise) {
				value.then(me.callWhenRendered.bind(me, 'set' + key));
			//else render with that value
			} else {
				renderData[key] = value;
			}
		});

		this.renderData = Ext.apply(this.renderData || {}, renderData);
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.getContext()
			.then(me.callWhenRendered.bind(me, 'setContext'));

		// if (me.hasComments()) {
		// 	me.commentsContianerEl.addCls('loading');
		// 	me.loadComments();
		// }
	},


	callWhenRendered: function(name, value) {
		if (!this.rendered) {
			this.on('afterrender', this[name].bind(this, value));
			return;
		}

		this[name].call(this, value);
	},

	//getters that the sub types should override
	//either return a string to put in the tpl or a Promise
	//that fulfills with a value to call the setter with
	getPath: function() { return ''; },
	getCurrent: function() { return ''; },
	getSharedWith: function() { return ''; },
	getTitle: function() { return ''; },
	getBody: function() { return ''; },
	getCommentCount: function() { return ''; },
	getContext: function() { return ''; },

	//this should be the same for all sub instances
	getCreatedTime: function() {
		var created = this.record.get('CreatedTime');

		return moment(created).format('MMM Do H:m A');
	},

	//this should be the same for all sub instances
	getCreator: function() {
		var rec = this.record,
			creator = rec.get('Creator');

		if (!Ext.isString(creator)) { return creator; }

		return UserRepository.getUser(creator)
			.then(function(user) {
				rec.set('Creator', user);

				return user;
			});
	},


	setPath: function(value) {
		this.setCurrent(value.shift());

		value.reverse();

		this.pathEl.update(value.join(' / '));
	},


	setCurrent: function(value) {
		this.currentEl.update(value);
	},


	setCreator: function(value) {
		var name = value.getName(),
			avatar = value.get('avatarURL');

		this.nameEl.update(name);
		this.avatarEl.setStyle({backgroundImage: 'url(' + avatar + ')'});
	},


	setSharedWith: function(value) {
		var me = this,
			sharingInfo = SharingUtils.sharedWithToSharedInfo(SharingUtils.resolveValue(value));

		SharingUtils.getLongTextFromShareInfo(sharingInfo, null, 2)
			.then(function(text) {
				if (me.sharedWithEl) {
					me.sharedWithEl.update(text);
				}
			});
	},


	setCreatedTime: function(value) {
		this.createdEl.update(value);
	},


	setTitle: function(value) {
		this.titleEl.update(value);
	},


	setBody: function(value) {
		this.bodyEl.update(value);
	},

	setCommentCount: function(value) {
		this.commentCountEl.update(Ext.util.Format.plural(value, 'Comment'));
	},


	setContext: function(context) {
		if (Ext.isEmpty(context) || !context.thumbnail) { return; }

		if (context.name) {
			this.contextTitleEl.update(context.name);
		}

		this.contextImageEl.set({'src': context.thumbnail});
		this.contextEl.addCls('has-context');

		if (!this.CACHE.height) {
			this.CACHE.height = this.height + 186;
		}
	}
});
