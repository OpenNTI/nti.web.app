const Ext = require('extjs');
const AnalyticsUtil = require('../../../../../util/Analytics');
const StoreUtils = require('legacy/util/Store');
require('legacy/model/User');
require('legacy/mixins/Router');
require('legacy/app/course/dashboard/components/tiles/Note');
require('legacy/app/course/dashboard/components/tiles/Topic');
require('legacy/app/course/dashboard/components/tiles/Blog');
require('./parts/NewPost');
require('legacy/app/windows/Actions');
const {wait} = require('legacy/util/Promise');

module.exports = exports = Ext.define('NextThought.app.profiles.community.components.activity.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community-activity',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'community-activity',
	layout: 'none',
	PAGE_SIZE: 50,
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.initRouter();

		this.addRoute('/', this.showActivity.bind(this));

		this.addDefaultRoute('/');

		this.WindowActions = NextThought.app.windows.Actions.create();

		this.newPostCmp = this.add({
			xtype: 'profiles-community-newpost',
			onNewPost: this.onNewPost.bind(this)
		});

		this.newPostCmp.hide();

		this.firstColumn = this.add({
			xtype: 'container',
			layout: 'none',
			cls: 'column left tile-container'
		});

		this.secondColumn = this.add({
			xtype: 'container',
			layout: 'none',
			cls: 'column right tile-container'
		});

		this.loadingCmp = this.add({
			xtype: 'box',
			cls: 'loading',
			autoEl: {html: 'Loading...'}
		});

		this.loadingCmp.addCls('hidden');

		this.on({
			activate: this.onActivate.bind(this),
			deactivate: this.onDeactivate.bind(this)
		});

		this.mon(this.firstColumn, 'remove', this.onRemove.bind(this));

		this.onScroll = this.onScroll.bind(this);
	},

	startResourceViewed: function () {
		var id = this.activeUser && this.activeUser.getId();

		if (id && !this.hasCurrentTimer) {
			const contextId = this.activeUser && this.activeUser.get('NTIID');
			AnalyticsUtil.getResourceTimer(id, {
				type: 'profile-activity-viewed',
				ProfileEntity: id,
				RootContextId: contextId
			});

			this.hasCurrentTimer = true;
		}
	},

	stopResourceViewed: function () {
		var id = this.activeUser && this.activeUser.getId();

		if (id && this.hasCurrentTimer) {
			AnalyticsUtil.stopResourceTimer(id, 'profile-activity-viewed');
			delete this.hasCurrentTimer;
		}
	},

	onActivate: function () {
		this.startResourceViewed();
		window.addEventListener('scroll', this.onScroll);
	},

	onDeactivate: function () {
		this.stopResourceViewed();
		window.removeEventListener('scroll', this.onScroll);
	},

	onRemove: function () {
		var i = this.firstColumn.items;
		if (Ext.isEmpty(i && i.items) && this.currentPage === -1) {
			this.showEmpty();
		}
	},

	userChanged: function (user) {
		if (this.activeUser !== user) {
			this.stopResourceViewed();
		}

		this.activeUser = user;

		this.startResourceViewed();

		return Promise.resolve();
	},

	setSourceURL: function (url, force) {
		//if we are loading the same feed don't bother doing any work
		if (this.feedUrl === url && !force) { return; }

		this.removeFeedItems();

		if (!url) {
			this.showEmpty();
			return;
		}

		var params = {
			batchSize: 50,
			batchStart: 0
		};

		this.clearEmpty();

		if (this.errorCmp) {
			this.errorCmp.destroy();
			delete this.errorCmp;
		}

		this.feedUrl = url;

		this.loadPage(1);
	},

	getActiveForum: function () {
		return this.postContainer;
	},

	setPostContainer: function (forum) {
		this.postContainer = forum;

		var title = forum && forum.getTitle();

		if (title === 'Forum') {
			title = null;
		}

		if (!forum || !forum.getLink('add')) {
			this.newPostCmp.hide();
		} else {
			this.newPostCmp.show();
			this.newPostCmp.setContainerTitle(title);
		}
	},

	showActivity: function (route, subRoute) {
		this.setTitle('Activity');
	},

	onNewPost: function () {
		if (this.postContainer && this.postContainer.getLink('add')) {
			this.WindowActions.showWindow('new-topic', null, this.newPostCmp.el.dom, {afterClose: this.onPostSaved.bind(this)}, {
				forum: this.postContainer
			});
		}
	},

	onPostSaved: function (record) {
		if (!record) { return; }

		var left = this.firstColumn, me = this;
		this.feedItems = (this.feedItems || []).concat([record]);

		this.__loadItem(record)
			.then(function (cmp) {
				if (cmp) {
					left.insert(0, cmp);
					me.clearEmpty();
				}
			});
	},

	addItems: function (items, feedUrl) {
		if (feedUrl !== this.feedUrl) {
			console.warn('Trying to add items from a different feed, dropping them on the floor');
			return;
		}

		this.feedItems = this.feedItems || [];
		items = items.filter(x => !this.feedItems.find( i => i.getId() === x.getId() ));
		this.feedItems = this.feedItems.concat(items);

		return this.__renderItems(items, feedUrl);
	},

	__loadItem: function (item) {
		var load;

		if (item instanceof NextThought.model.forums.CommunityHeadlineTopic) {
			load = NextThought.app.course.dashboard.components.tiles.Topic.getTileConfig(item, null, 334, true);
		} else if (item instanceof NextThought.model.Note) {
			load = NextThought.app.course.dashboard.components.tiles.Note.getTileConfig(item, null, 334, true);
		} else if (item instanceof NextThought.model.forums.PersonalBlogEntry) {
			load = NextThought.app.course.dashboard.components.tiles.Blog.getTileConfig(item, null, 334, true);
		} else {
			console.warn('Unknown item in activity: ', item);
			load = Promise.resolve(null);
		}

		return load;
	},

	__renderItems: function (items, feedUrl) {
		var me = this,
			left = me.firstColumn,
			right = me.secondColumn;

		me.loadingItems = true;

		items = items.map(me.__loadItem.bind(me));

		return Promise.all(items)
			.then(function (results) {
				return results.filter(function (x) { return !!x;});
			})
			.then(function (cmps) {
				if (feedUrl !== me.feedUrl) {
					console.warn('Trying to add items for a different feed, dropping them on the floor');
					return;
				}

				cmps.forEach(function (cmp, index) {
					if (index % 2) {
						right.add(cmp);
					} else {
						left.add(cmp);
					}
				});
			});
	},

	removeFeedItems: function () {
		this.feedItems = [];
		this.firstColumn.removeAll(true);
		this.secondColumn.removeAll(true);
	},

	showEmpty: function () {
		if (!this.emptyCmp) {
			this.emptyCmp = this.add({
				xtype: 'box',
				cls: 'empty-text',
				autoEl: {html: 'No Activity'}
			});
		}
	},

	clearEmpty: function () {
		if (this.emptyCmp) {
			this.emptyCmp.destroy();
			delete this.emptyCmp;
		}
	},

	/**
	 * Given a page number load that batch for the feedUrl. Capture the current feedUrl in the closure, then check
	 * to see if its changed by the time we've loaded. If it has don't do anything so we can avoid getting tiles from
	 * the wrong batch
	 *
	 * @param  {Number} page the page number to load
	 */
	loadPage: function (page) {
		var me = this,
			feedUrl = me.feedUrl,
			params = {
				batchSize: me.PAGE_SIZE,
				batchStart: (page - 1) * me.PAGE_SIZE,
				sortOn: 'createdTime',
				sortOrder: 'descending'
			};

		me.isLoading = true;
		me.loadingCmp.removeCls('hidden');

		me.currentPage = page;

		StoreUtils.loadBatch(me.feedUrl, params)
			.then(function (batch) {
				if (feedUrl !== me.feedUrl) {
					console.warn('Loaded batch for a different feedurl than the active, drop it on the floor');
				} else {
					me.onBatchLoad(batch, feedUrl);
				}
			})
			.catch(function (reason) {
				if (feedUrl !== me.feedUrl) {
					console.warn('Failed to loaded batch for a different feedurl than the active, drop it on the floor');
				} else {
					me.onBatchError(reason);
				}
			});
	},

	onBatchError: function (error) {
		console.error('Failed to load community activity: ', error);

		this.loadingCmp.addCls('hidden');

		this.isLoading = false;

		this.currentPage = -1;

		const status = (error || {}).status;
		const msg = status === 403 ? 'You don\'t have access to this community.' : 'Error loading activity.';

		this.errorCmp = this.add({
			xtype: 'box',
			cls: 'error',
			autoEl: {html: msg}
		});

		if (status === 403 && this.newPostCmp) {
			wait()
				.then(() => this.newPostCmp.hide());
		}

	},

	onBatchLoad: function (batch, feedUrl) {
		var nextLink = batch.Links && Service.getLinkFrom(batch.Links, 'batch-next');

		this.isLoading = false;
		this.newPostCmp.show();

		//if we have items
		if (batch.ItemCount) {
			this.addItems(batch.Items, feedUrl)
				.always(this.loadingCmp.addClass.bind(this.loadingCmp, 'hidden'));
		//if we don't have items and this is our first load, show an empty state
		} else if (this.currentPage === 1) {
			this.currentPage = -1;
			this.loadingCmp.addCls('hidden');
			this.showEmpty();
		}

		//if the number we got back is smaller than the number we requests, assume that was the last page
		if (batch.ItemCount < this.PAGE_SIZE) {
			this.currentPage = -1;
		}

		if (batch && batch.Items && batch.Items.length > 0) {
			this.clearEmpty();
		}

		this.nextBatchLink = nextLink;
	},

	loadNextBatch: function () {
		if (this.currentPage > 0) {
			this.loadPage(this.currentPage + 1);
		}
	},

	getScrollEl: function () {
		//TODO: figure out how to not have to do a user agent check for this
		return Ext.isIE11p || Ext.isGecko ? document.documentElement : document.body;
	},

	onScroll: function () {
		var height = document.documentElement.clientHeight,
			el = this.getScrollEl(),
			scrollTop = el.scrollTop,
			scrollHeight = el.scrollHeight;

		if (scrollTop + height >= scrollHeight && !this.isLoading) {
			this.loadNextBatch();
		}
	}
});
