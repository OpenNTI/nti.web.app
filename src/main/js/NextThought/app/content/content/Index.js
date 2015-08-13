Ext.define('NextThought.app.content.content.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.bundle-content',

	requires: [
		'NextThought.app.content.Actions',
		'NextThought.app.contentviewer.StateStore',
		'NextThought.common.components.ResourceNotFound'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},


	layout: 'none',

	cls: 'bundle-content',


	initComponent: function() {
		this.callParent(arguments);

		this.ContentActions = NextThought.app.content.Actions.create();

		this.initRouter();

		this.addRoute('/', this.showRoot.bind(this));
		this.addRoute('/:id', this.showContent.bind(this));
		this.addRoute('/:id/:page', this.showPage.bind(this));

		this.addDefaultRoute('/');

		this.on({
			'beforedeactivate': this.onBeforeDeactivate.bind(this),
			'activate': this.onActivate.bind(this),
			'deactivate': this.onDeactivate.bind(this)
		});

		this.on('beforedeactivate', this.onBeforeDeactivate.bind(this));
	},


	onActivate: function() {
		if (this.reader) {
			this.reader.fireEvent('activate');
		}
	},


	onDeactivate: function() {
		if (this.reader) {
			this.reader.fireEvent('deactivate');
		}
	},


	getContext: function() {
		if (this.reader) {
			return this.reader.pageInfo || this.reader.relatedWork;
		}
	},


	getActiveItem: function() {
		return this.reader;
	},


	getLocation: function() {
		return this.reader.getLocation();
	},


	onBeforeDeactivate: function() {
		if (!this.reader) { return; }

		this.reader.hide();

		this.reader.destroy();
	},


	bundleChanged: function(bundle) {
		if (bundle === this.currentBundle) { return; }

		if (this.reader) {
			this.reader.destroy();
		}

		this.root = bundle.getFirstPage();
		this.currentBundle = bundle;
	},


	__loadContent: function(id, obj) {
		if (obj && obj.getId() === id) {
			return Promise.resolve(obj);
		}

		return Service.getObject(id)
			.then(function(obj) {
				//If we didn't get a page (PageInfo or RelatedWork), just get a page info
				if (!obj.isPage) {
					return Service.getPageInfo(id);
				}

				return obj;
			});
	},


	showReader: function(page, parent, hash) {
		if (!this.rendered) {
			this.on('afterrender', this.showReader.bind(this, page));
			return;
		}

		var rootRoute = this.rootRoute || '',
			pageSource = this.ContentActions.getContentPageSource(page.getId(), this.currentBundle, this.root);

		if (this.reader) {
			this.reader.destroy();
		}

		pageSource.then(function(ps) {
			ps.getRoute = function(ntiid) {
				return rootRoute + ParseUtils.encodeForURI(ntiid);
			};
		});

		this.pageId = page.getId();

		this.reader = NextThought.app.contentviewer.Index.create({
			pageInfo: page instanceof NextThought.model.PageInfo ? page : null,
			relatedWork: page instanceof NextThought.model.RelatedWork ? page : null,
			toc: !this.currentBundle.isCourse ? this.ContentActions.getTocStore(this.currentBundle) : null,
			path: this.ContentActions.getContentPath(page.getId(), this.currentBundle, parent),
			pageSource: pageSource,
			bundle: this.currentBundle,
			handleNavigation: this.handleNavigation.bind(this),
			navigateToObject: this.navigateToObject && this.navigateToObject.bind(this),
			fragment: hash,
			hideHeader: this.hideHeader
		});

		this.setTitle(page.get('label'));

		this.add(this.reader);
		this.reader.fireEvent('activate');
	},


	__onFail: function(reason) {
		console.error('Failed to load page:', reason);
		this.setTitle('Not Found');

		if (!this.notFound) {
			this.notFound = this.add({
				xtype: 'notfound',
				gotoLibrary: this.pushRootRoute.bind(this, 'Library', '/')
			});
		}
	},



	showContent: function(route, subRoute) {
		var me = this,
			ntiid = route.params.id,
			obj = route.precache.pageInfo || route.precache.relatedWork;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		return this.__loadContent(ntiid, obj)
			.then(function(page) {
				me.showReader(page, route.precache.parent, route.hash);
			});
	},


	showPage: function(route, subRoute) {
	 	var me = this,
	 		root = route.params.id,
	 		page = route.params.page,
	 		obj = route.precache.pageInfo || route.precache.relatedWork;

	 	root = ParseUtils.decodeFromURI(root);
	 	page = ParseUtils.decodeFromURI(page);

	 	if (!this.root) {
	 		this.root = root;
	 	} else if (this.root !== root) {
	 		console.warn('Trying to show a reading a root that is different form what we got the root set as...');
	 	}

	 	return this.__loadContent(page, obj)
	 		.then(function(page) {
	 			me.showReader(page, route.precache.parent);
	 		});
	},


	showRoot: function(route, subRoute) {
		var me = this;

		return Service.getPageInfo(this.root)
			.then(function(pageInfo) {
				me.showReader(pageInfo, null, route.hash);
			})
			.fail(this.__onFail.bind(this));
	},


	handleNavigation: function(title, route, precache) {
		this.pushRoute(title, route, precache);
	}
});
