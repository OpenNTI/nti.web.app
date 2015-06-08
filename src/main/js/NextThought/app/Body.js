Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	state_key: 'main-view',

	requires: [
		'NextThought.app.library.Index',
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
		this.mon(this.WindowStore, 'push-window', this.pushWindow.bind(this));

		this.addRoute('/library', this.setLibraryActive.bind(this));
		this.addRoute('/course/:id', this.setCourseActive.bind(this));

		this.addDefaultRoute('/library');
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


	afterRoute: function() {
		var state = this.getRouteState();

		if (state.openWindow) {
			this.WindowActions.showWindow(state.openWindow);
		}
	},


	pushWindow: function(obj, title, route, precache) {
		if (!title) {
			title = this.ContextStore.getCurrentTitle();
		}

		if (!route) {
			route = this.ContextStore.getCurrentRoute();
		}

		this.pushRouteState(obj, title, route, precache);
	},


	setLibraryActive: function(route, subRoute) {
		var library = this.setActiveCmp('library-view-container');

		return library.handleRoute(subRoute, route.precache);
	},


	setCourseActive: function(route, subRoute) {
		var me = this;
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
