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

		this.loadingCmp.hide();
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

		this.loadingCmp.show();

		if (this.emptyCmp) {
			this.emptyCmp.destroy();
			delete this.emptyCmp;
		}

		if (this.errorCmp) {
			this.errorCmp.destroy();
			delete this.errorCmp;
		}

		this.feedUrl = url;

		StoreUtils.loadBatch(url, params)
			.then(this.onBatchLoad.bind(this))
			.fail(this.onBatchError.bind(this));
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
			this.WindowActions.showWindow('new-topic', null, this.newPostCmp.el.dom, null, {
				forum: this.postContainer
			});
		}
	},


	addItems: function(items) {
		this.feedItems = this.feedItems || [];

		this.feedItems.concat(items);

		return this.renderItems(items);
	},


	renderItems: function(items) {
		var left = this.firstColumn,
			right = this.secondColumn;

		items = items.map(function(item, index) {
			var load;

			if (item instanceof NextThought.model.forums.CommunityHeadlineTopic) {
				load = NextThought.app.course.dashboard.components.tiles.Topic.getTileConfig(item, null, 337);
			} else if (item instanceof NextThought.model.Note) {
				load = NextThought.app.course.dashboard.components.tiles.Note.getTileConfig(item, null, 337);
			} else {
				console.warn('Unknown item in activity: ', item);
				load = Promise.resolve(null);
			}

			return load;
		});

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


	onBatchError: function(error) {
		console.error('Failed to load community activity: ', error);

		this.errorCmp = this.add({
			xtype: 'box',
			cls: 'error',
			autoEl: {html: 'Error loading activity.'}
		});
	},


	onBatchLoad: function(batch) {
		var nextLink = batch.Links && Service.getLinkFrom(batch.Links, 'batch-next');


		if (batch.ItemCount) {
			this.addItems(batch.Items)
				.always(this.loadingCmp.hide.bind(this.loadingCmp));
		} else {
			this.loadingCmp.hide();
			this.showEmpty();
		}

		this.nextBatchLink = nextLink;
	}
});
