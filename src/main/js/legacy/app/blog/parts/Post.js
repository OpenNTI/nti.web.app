var Ext = require('extjs');
var Globals = require('../../../util/Globals');
var {isMe} = Globals;
var ParseUtils = require('../../../util/Parsing');
var SharingUtils = require('../../../util/Sharing');
var OldTopic = require('./old/Topic');
var MixinsSearchable = require('../../../mixins/Searchable');
var PartsComment = require('./Comment');
var StoreBlog = require('../../../store/Blog');
var BlogActions = require('../Actions');


module.exports = exports = Ext.define('NextThought.app.blog.parts.Post', {
	extend: 'NextThought.app.blog.parts.old.Topic',
	alias: 'widget.profile-blog-post',

	mixins: {
		Searchable: 'NextThought.mixins.Searchable'
	},

	cls: 'entry',
	defaultType: 'profile-blog-comment',

	pathTpl: Ext.DomHelper.markup([
		{cls: 'path', cn: [
			{tag: 'span', cls: 'part back-part', 'data-qtip': '{path}', html: '{path}'},
			{tag: 'span', cls: 'part title-part current', 'data-qtip': '{title}' , html: '{title}'}
		]}
	]),

	constructor: function () {
		this.threaded = false;
		this.callParent(arguments);

		this.BlogActions = NextThought.app.blog.Actions.create();
	},

	beforeRender: function () {
		this.callParent(arguments);

		var r, headline = this.record.get('headline');

		this.renderData = Ext.apply(this.renderData || {},{
			showName: true,
			headerCls: 'blog-post',
			path: 'Thoughts',
			showPermissions: true
		});

		r = this.renderData;

		if (!headline || !headline.getData) {
			console.warn('The record does not have a story field or it does not implement getData()', r);

			Ext.defer(this.destroy, 1, this);
			return;
		}

		r.headline = headline.getData();
		r.headline.tags = Ext.Array.filter(r.headline.tags, function (t) {
			return !ParseUtils.isNTIID(t);
		});
	},

	renderSelectors: {
		publishStateEl: '.meta .state'
	},

	setPath: function () {},

	updateRecord: function (record, store) {
		if (!record || !store) { return; }

		try {
			var count = store.getCount(),
				index = store.indexOf(record);

			if (index > 0) {
				this.prevRecord = store.getAt(index - 1);
				this.prevPostEl.removeCls('disabled');
			}

			if (index < (count - 1)) {
				this.nextRecord = store.getAt(index + 1);
				this.nextPostEl.removeCls('disabled');
			}
		} catch (e) {
			console.error(e.stack || e.message || e);
		}
	},

	updateField: function (key, value) {
		var el = this.el.down('.' + key), len;
		if (el) {
			if (Ext.isArray(value) && key === 'tags') {
				len = value.length;

				value = Ext.Array.filter(value, function (v) { return !ParseUtils.isNTIID(v); });
				if (len !== value.length) {
					this.setPublishAndSharingState();
				}

				el.update(this.tagTpl.apply(value));
				return;
			}
			el.update(value);
		}
	},

	buildStore: function () {
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

	afterRender: function () {
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
		this.initSearch();
	},

	getContainerIdForSearch: function () {
		return this.record.get('NTIID');
	},

	onceReadyForSearch: function () {
		return wait();
	},

	closeView: function () {
		if (this.closedPost) {
			return;
		}

		this.closedPost = true;
		this.getMainView().scrollTo('top', 0, true);

		if (!this.destroying) {
			this.destroy();
		}
	},

	saveComment: function (editor, record, valueObject) {
		var me = this;

		if (me.editor.el) {
			me.editor.el.mask('Saving...');
			me.editor.el.repaint();
		}

		me.BlogActions.saveBlogComment(record, me.record, valueObject)
			.then(function (comment) {
				if (!me.isDestroyed) {
					if (!record) {
						if (me.store) {
							me.store.insert(0, comment);
						}
					}
				}

				if (me.el && me.postCountEl) {
					me.postCountEl.update(Ext.util.Format.plural(me.record.get('PostCount'), 'Comment'));
				}

				me.editor.deactivate();
				me.editor.setValue('');
				me.editor.reset();
			}).always(function () {
				if (me.editor.el) {
					me.editor.el.unmask();
				}
			});
	},

	navigationClick: function (e) {
		e.stopEvent();
		var direction = Boolean(e.getTarget('.next')),
			disabled = Boolean(e.getTarget('.disabled'));

		if (!disabled) {
			this.fireEvent('navigate-post', this, this.record, direction ? 'prev' : 'next');
		}

		return false;
	},

	getMainView: function () {
		return this.getEl().getScrollingEl();
	},

	onDestroy: function () {
		this.closeView();
		this.callParent(arguments);
	},

	fireDeleteEvent: function () {
		this.el.mask('Deleting...');

		this.BlogActions.deleteBlogPost(this.record)
			.then(this.fireEvent.bind(this, 'record-deleted'))
			.fail(() => {
				this.el.unmask();
			});
	},

	destroyWarningMessage: function () {
		return getString('NextThought.view.profiles.parts.BlogPost.warning');
	},

	onEditPost: function (e) {
		e.stopEvent();
		this.fireEvent('edit-topic', this.record);
	},

	setPublishAndSharingState: function () {
		this.updateSharedWith('sharedWith', this.record.get('sharedWith'));
	},

	updateSharedWith: function (field, value) {
		var sharingInfo, tags,
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

		SharingUtils.getTagSharingShortText(sharingInfo, tags, published, function (str) {
			if (this.publishStateEl) {
				this.publishStateEl.update(str);
			}
		}, this);
		SharingUtils.getTagSharingLongText(sharingInfo, tags, published, function (str) {
			if (this.publishStateEl) {
				this.publishStateEl.set({'data-qtip': str});
			}
		}, this);
		this.publishStateEl[published ? 'removeCls' : 'addCls']('private');
	},

	addIncomingComment: function (item) {
		if (this.isVisible() && item.get('ContainerId') === this.record.getId() && isMe(this.record.get('Creator'))) {
			this.addComments(this.store, [item]);
		}
	},

	onReady: function () {
		function scrollCommentIntoView () {
			if (typeof (me.scrollToComment) === 'boolean') {
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
			Ext.each(images, function (img) {
				img.onload = function () { scrollCommentIntoView(); };
			});
			scrollCommentIntoView();
		}
	},

	//Search hit highlighting
	getSearchHitConfig: function () {
		return {
			key: 'blog',
			mainViewId: 'profile'
		};
	}
});
