Ext.define('NextThought.app.profiles.community.components.activity.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.profile-community-activity',

	requires: [
		'NextThought.app.course.dashboard.components.tiles.Note',
		'NextThought.app.course.dashboard.components.tiles.Topic',
		'NextThought.app.profiles.community.components.activity.parts.NewPost',
		'NextThought.app.windows.Actions',
		'NextThought.util.Store'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	cls: 'community-activity',
	layout: 'none',

	PAGE_SIZE: 50,

	items: [],

	initComponent: function() {
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


		this.onScroll = this.onScroll.bind(this);
	},


	onActivate: function() {
		window.addEventListener('scroll', this.onScroll);
	},


	onDeactivate: function() {
		window.removeEventListener('scroll', this.onScroll);
	},


	setSourceURL: function(url) {
		//if we are loading the same feed don't bother doing any work
		if (this.feedUrl === url) { return; }

		this.removeFeedItems();

		if (!url) {
			this.showEmpty();
			return;
		}

		var params = {
			batchSize: 50,
			batchStart: 0
		};

		if (this.emptyCmp) {
			this.emptyCmp.destroy();
			delete this.emptyCmp;
		}

		if (this.errorCmp) {
			this.errorCmp.destroy();
			delete this.errorCmp;
		}

		this.feedUrl = url;

		this.loadPage(1);
	},


	getActiveForum: function() {
		return this.postContainer;
	},


	setPostContainer: function(forum) {
		this.postContainer = forum;

		if (!forum || !forum.getLink('add')) {
			this.newPostCmp.hide();
		} else {
			this.newPostCmp.show();
		}
	},


	showActivity: function(route, subRoute) {
		this.setTitle('Activity');
	},


	onNewPost: function() {
		if (this.postContainer && this.postContainer.getLink('add')) {
			this.WindowActions.showWindow('new-topic', null, this.newPostCmp.el.dom, {afterClose: this.onPostSaved.bind(this)}, {
				forum: this.postContainer
			});
		}
	},


	onPostSaved: function(record) {
		if (!record) { return; }

		var left = this.firstColumn;

		this.__loadItem(record)
			.then(function(cmp) {
				if (cmp) {
					left.insert(0, cmp);
				}
			});
	},


	addItems: function(items) {
		this.feedItems = this.feedItems || [];

		this.feedItems.concat(items);

		return this.__renderItems(items);
	},



	__loadItem: function(item) {
		var load;

		if (item instanceof NextThought.model.forums.CommunityHeadlineTopic) {
			load = NextThought.app.course.dashboard.components.tiles.Topic.getTileConfig(item, null, 336, true);
		} else if (item instanceof NextThought.model.Note) {
			load = NextThought.app.course.dashboard.components.tiles.Note.getTileConfig(item, null, 336, true);
		} else {
			console.warn('Unknown item in activity: ', item);
			load = Promise.resolve(null);
		}

		return load;
	},


	__renderItems: function(items) {
		var left = this.firstColumn,
			right = this.secondColumn;

		items = items.map(this.__loadItem.bind(this));

		return Promise.all(items)
			.then(function(results) {
				return results.filter(function(x) { return !!x;});
			})
			.then(function(cmps) {
				cmps.forEach(function(cmp, index) {
					if (index % 2) {
						right.add(cmp);
					} else {
						left.add(cmp);
					}
				});
			});
	},


	removeFeedItems: function() {
		this.feedItems = [];
		this.firstColumn.removeAll(true);
		this.secondColumn.removeAll(true);
	},


	showEmpty: function() {
		this.emptyCmp = this.add({
			xtype: 'box',
			cls: 'empty-text',
			autoEl: {html: 'No Activity'}
		});
	},


	loadPage: function(page) {
		var params = {
				batchSize: this.PAGE_SIZE,
				batchStart: (page - 1) * this.PAGE_SIZE
			};

		this.loadingCmp.removeCls('hidden');

		this.currentPage = page;

		StoreUtils.loadBatch(this.feedUrl, params)
			.then(this.onBatchLoad.bind(this))
			.fail(this.onBatchError.bind(this));
	},


	onBatchError: function(error) {
		console.error('Failed to load community activity: ', error);

		this.loadingCmp.removeCls('hidden');

		this.currentPage = -1;

		this.errorCmp = this.add({
			xtype: 'box',
			cls: 'error',
			autoEl: {html: 'Error loading activity.'}
		});
	},


	onBatchLoad: function(batch) {
		var nextLink = batch.Links && Service.getLinkFrom(batch.Links, 'batch-next');

		//if the number we got back is smaller than the number we requests, assume that was the last page
		if (batch.ItemCount < this.PAGE_SIZE) {
			this.currentPage = -1;
		}

		//if we have items
		if (batch.ItemCount) {
			this.addItems(batch.Items)
				.always(this.loadingCmp.addClass.bind(this.loadingCmp, 'hidden'));
		//if we don't have items and this is our first load, show an empty state
		} else if (this.currentPage === 1) {
			this.currentPage = -1;
			this.loadingCmp.addCls('hidden');
			this.showEmpty();
		}

		this.nextBatchLink = nextLink;
	},


	loadNextBatch: function() {
		if (this.currentPage > 0) {
			this.loadPage(this.currentPage + 1);
		}
	},


	onScroll: function() {
		var height = document.documentElement.clientHeight,
			scrollTop = document.body.scrollTop,
			scrollHeight = document.body.scrollHeight;

		if (scrollTop + height >= scrollHeight) {
			this.loadNextBatch();
		}
	}
});
