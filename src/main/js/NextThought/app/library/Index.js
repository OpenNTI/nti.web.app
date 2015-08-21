Ext.define('NextThought.app.library.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-container',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	requires: [
		'NextThought.app.navigation.Actions',
		'NextThought.app.library.communities.Index',
		'NextThought.app.library.admin.Index',
		'NextThought.app.library.content.Index',
		'NextThought.app.library.courses.Index',
		'NextThought.app.library.Home'
	],

	layout: 'card',
	cls: 'library-view',

	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.NavActions = NextThought.app.navigation.Actions.create();

		this.addRoute('/', this.showHome.bind(this));
		this.addRoute('/courses', this.showCourses.bind(this));
		this.addRoute('/admin', this.showAdminCourses.bind(this));
		this.addRoute('/books', this.showBooks.bind(this));
		this.addRoute('/communities', this.showCommunities.bind(this));
		this.addDefaultRoute('/');
	},


	setActiveView: function(xtype) {
		var old = this.getLayout().getActiveItem(),
			cmp = this.down(xtype);

		if (!cmp) {
			cmp = this.add(Ext.widget(xtype));

			this.addChildRouter(cmp);
		}

		this.getLayout().setActiveItem(cmp);

		this.NavActions.updateNavBar({
			noLibraryLink: true,
			darkStyle: true
		});

		this.NavActions.setActiveContent(null);

		//If this is the first element added, the card layout
		//wont' fire the activate event so trigger it ourselves.
		if (!old) {
			cmp.fireEvent('activate');
		}


		return cmp;
	},


	showHome: function(route, subRoute) {
		var cmp = this.setActiveView('library-home');

		this.setTitle('Home');

		return cmp.handleRoute(subRoute, route.params);
	},


	showCourses: function(route, subRoute) {
		var cmp = this.setActiveView('library-courses');

		return cmp.handleRoute(subRoute, route.params);
	},


	showAdminCourses: function(route, subRoute) {
		var cmp = this.setActiveView('library-admin');

		return cmp.handleRoute(subRoute, route.params);
	},


	showBooks: function(route, subRoute) {
		var cmp = this.setActiveView('library-content');

		return cmp.handleRoute(subRoute, route.params);
	},


	showCommunities: function(route, subRoute) {
		var cmp = this.setActiveView('library-communities');

		return cmp.handleRoute(subRoute, route.params);
	}
});
