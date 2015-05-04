Ext.define('NextThought.app.Body', {
	extend: 'Ext.container.Container',
	alias: 'widget.main-views',

	requires: [
		'NextThought.app.library.Index',
		'NextThought.app.course.Index',
		'NextThought.util.Parsing',
		'NextThought.app.navigation.StateStore'
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

		this.mon(this.NavigationStore, 'set-active-content', this.updateBodyContent.bind(this));

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


	setLibraryActive: function(route, subRoute) {
		var library = this.setActiveCmp('library-view-container');

		return library.handleRoute(subRoute);
	},


	setCourseActive: function(route, subRoute) {
		var me = this;
			course = me.setActiveCmp('course-view-container'),
			ntiid = route.params.id;

		ntiid = ParseUtils.decodeFromURI(ntiid);

		return course.setActiveCourse(ntiid)
			.then(course.handleRoute.bind(course, subRoute))
			.fail(function() {
				me.replaceRoute('', '/library');
			});
	},


	updateBodyContent: function(bundle) {
		var body = Ext.getBody();


		if (!bundle) {
			body.setStyle({backgroundImage: ''});
		} else {
			body.setStyle({backgroundImage: 'url(' + bundle.getBackgroundImage() + ')'});
		}
	}
});
