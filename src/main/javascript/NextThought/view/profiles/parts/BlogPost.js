Ext.define('NextThought.view.profiles.parts.BlogPost', {
	extend: 'NextThought.view.forums.Topic',
	alias: 'widget.profile-blog-post',

	requires: [
		'NextThought.view.profiles.parts.BlogComment'
	],

	cls: 'entry',
	defaultType: 'profile-blog-comment',

	constructor: function() {
		this.mixins.HeaderLock.disable.call(this);
		this.callParent(arguments);
	},


	beforeRender: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {},{
			showName: false,
			headerCls: 'blog-post',
			path: 'Thoughts',
			showPermissions: true
		});
	},


	renderSelectors: {
		publishStateEl: '.meta .state'
	},


	setPath: function() {
		var me = this, tpl, title;
		Ext.defer(function() {
			if (me.rendered) {
				tpl = new Ext.XTemplate(me.pathTpl);
				title = me.record.get('title');
				tpl.insertFirst(me.headerEl, {path: 'Thoughts', title: title}, true);
			}
		}, 1);
	},


	buildStore: function() {
		this.store = NextThought.store.Blog.create({
			storeId: this.record.get('Class') + '-' + this.record.get('NTIID')
		});
		this.store.proxy.url = this.getRecord().getLink('contents');

		this.mon(this.store, {
			scope: this,
			add: this.addComments,
			load: this.loadComments
		});

		this.store.load();
	},


	afterRender: function() {
		this.callParent(arguments);
		var commentId;

		if (!Ext.isEmpty(this.selectedSections)) {
			commentId = this.selectedSections[1];
			console.debug('Do something with this/these:', this.selectedSections);
			if (this.selectedSections[0] === 'comments' && !commentId) {
				this.scrollToComment = true;
			}
			else if (commentId) {
				this.scrollToComment = commentId;
			}
		}

		this.record.addObserverForField(this, 'sharedWith', this.updateSharedWith, this);
	},


	closeView: function() {
		if (this.closedPost) {
			return;
		}

		this.closedPost = true;

		//All of this belongs somewhere else... its animation code (css implements the keyframes)
    //		var bar = this.headerEl;
    //		if( bar ) {
    //			bar.removeCls('animateIn animateOut').addCls('animateOut');
    //		}

		this.getMainView().scrollTo('top', 0, true);

		if (!this.destroying) {
			this.destroy();
		}
	},


	getScrollHeaderCutoff: function() {
		return 268;
	},


	navigationClick: function(e) {
		e.stopEvent();
		var direction = Boolean(e.getTarget('.next')),
			disabled = Boolean(e.getTarget('.disabled'));

		if (!disabled) {
			this.fireEvent('navigate-post', this, this.record, direction ? 'next' : 'prev');
		}

		return false;
	},


	getMainView: function() {
		return Ext.get('profile');
	},


	onDestroy: function() {
		this.closeView();
		this.callParent(arguments);
	},


	fireDeleteEvent: function() { this.fireEvent('delete-post', this.record, this); },


	destroyWarningMessage: function() {
		return 'Deleting your thought will permanently remove it and any comments.';
	},


	onEditPost: function(e) {
		e.stopEvent();
		this.fireEvent('show-post', this.record.get('ID'), 'edit');
	},


	setPublishAndSharingState: function() {
		this.updateSharedWith('sharedWith', this.record.get('sharedWith'));
	},


	updateSharedWith: function(field, value) {
		var p = SharingUtils.sharedWithToSharedInfo(value).publicToggleOn,
			e = this.publishStateEl;

		e.update(p ? 'Public':'Private')[p ? 'removeCls' : 'addCls']('private');
	},


	addIncomingComment: function(item) {
		if (this.isVisible() && item.get('ContainerId') === this.record.getId() && isMe(this.record.get('Creator'))) {
			this.addComments(this.store, [item]);
		}
	},


	onReady: function() {
		function scrollCommentIntoView() {
			if (typeof(me.scrollToComment) === 'boolean') {
				el = me.getTargetEl();
			}
			else {
				el = me.el.down('[data-commentid="' + me.scrollToComment + '"]');
			}

			if (el) {
				Ext.defer(el.scrollIntoView, 500, el, [Ext.get('profile'), false, Globals.ANIMATE_NO_FLASH]);
			}
		}

		console.debug('ready', arguments);
		var el, images, me = this;
		if (this.scrollToComment) {
			images = this.el.query('img');
			Ext.each(images, function(img) {
				img.onload = function() { scrollCommentIntoView(); };
			});
			scrollCommentIntoView();
		}
	},


	//Search hit highlighting
	getSearchHitConfig: function() {
		return {
			key: 'blog',
			mainViewId: 'profile'
		};
	}

});
