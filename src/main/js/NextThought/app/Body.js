Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	state_key: 'main-view',

	requires: [
		'NextThought.app.library.Index',
		'NextThought.app.content.Index',
		'NextThought.app.course.Index',
		'NextThought.util.Parsing',
		'NextThought.app.navigation.StateStore',
		'NextThought.app.windows.Index',
		'NextThought.app.windows.StateStore',
		'NextThought.app.windows.Actions',
		'NextThought.app.context.StateStore'
	],

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	layout: 'card',

	cls: 'main-body',

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.initRouter();

		this.NavigationStore = NextThought.app.navigation.StateStore.getInstance();
		this.WindowStore = NextThought.app.windows.StateStore.getInstance();
		this.WindowActions = NextThought.app.windows.Actions.create();
		this.ContextStore = NextThought.app.context.StateStore.getInstance();

		this.mon(this.NavigationStore, 'set-active-content', this.updateBodyContent.bind(this));
		this.mon(this.WindowStore, {
			'push-window': this.pushWindow.bind(this)
		});
		this.mon(this.ContextStore, 'new-context', this.onNewContext.bind(this));

		this.addRoute('/library', this.setLibraryActive.bind(this));
		this.addRoute('/course/:id', this.setCourseActive.bind(this));
		this.addRoute('/bundle/:id', this.setBundleActive.bind(this));

		this.addDefaultRoute('/library');
	},


	allowNavigation: function() {
		var win = this.WindowStore.allowNavigation();

		//if the window stops it or returns a promise don't keep looking
		if ((win === false) || win instanceof Promise) {
			return win;
		}

		return this.mixins.Router.allowNavigation.call(this);
	},


	setActiveCmp: function(xtype) {
		var cmp = this.down(xtype);

		if (!cmp) {
			cmp = Ext.widget(xtype);

			this.addChildRouter(cmp);
		}

		this.getLayout().setActiveItem(cmp);

		return cmp;
	},


	beforeRoute: function() {
		this.WindowActions.closeActiveWindow();
	},


	onNewContext: function() {
		var id = this.ContextStore.getCurrentObjectId();

		if (id) {
			this.WindowActions.showWindow(id);
		}
	},


	lockHeight: function() {
		if (!this.rendered) {
			this.on('afterrender', this.lockHeight.bind(this));
			return;
		}

		var headerHeight = this.el.dom.getBoundingClientRect().top,
			windowHeight = Ext.Element.getViewportHeight();

		this.el.setStyle({height: (windowHeight - headerHeight) + 'px'});
		this.addCls('height-locked');
	},


	unlockHeight: function() {
		if (!this.rendered) {
			this.on('afterrender', this.unlockHeight.bind(this));
			return;
		}

		this.el.setStyle({height: 'auto'});
		this.removeCls('height-locked');
	},


	pushWindow: function(id, title, route, precache) {
		if (!title) {
			title = this.ContextStore.getCurrentTitle();
		}

		if (!route) {
			route = this.ContextStore.getCurrentRoute();
		}

		if (id) {
			id = ParseUtils.encodeForURI(id);
			route = Globals.trimRoute(route) + '/object/' + id;
		} else {
			route = this.ContextStore.removeObjectRoute();
		}


		this.pushRoute(title, route, precache);
	},


	setLibraryActive: function(route, subRoute) {
		var library = this.setActiveCmp('library-view-container');

		return library.handleRoute(subRoute, route.precache);
	},


	setCourseActive: function(route, subRoute) {
		var me = this,
			courseView = me.setActiveCmp('course-view-container'),
			ntiid = route.params.id,
			course = route.precache.course;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		return courseView.setActiveCourse(ntiid, course)
			.then(courseView.handleRoute.bind(courseView, subRoute, route.precache))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},


	setBundleActive: function(route, subRoute) {
		var me = this,
			bundleView = me.setActiveCmp('bundle-view-container'),
			ntiid = route.params.id,
			bundle = route.precache.bundle;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		return bundleView.setActiveBundle(ntiid, bundle)
			.then(bundleView.handleRoute.bind(bundleView, subRoute, route.precache))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},


	updateBodyContent: function(bundle) {
		var body = Ext.getBody(),
			backgroundImage = bundle && bundle.getBackgroundImage();

		if (!backgroundImage) {
			body.setStyle({backgroundImage: ''});
		} else {
			body.setStyle({backgroundImage: 'url(' + bundle.getBackgroundImage() + ')'});
		}
	}
});
