Ext.define('NextThought.app.library.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-view-container',

	state_key: 'main-library-view',

	mixins: {
		Router: 'NextThought.mixins.Router',
		State: 'NextThought.mixins.State'
	},

	requires: [
		'NextThought.app.navigation.Actions',
		'NextThought.app.bundle.Actions',
		'NextThought.app.course.Actions',
		'NextThought.app.library.Actions',
		'NextThought.app.library.StateStore',
		'NextThought.app.library.components.Navigation',
		'NextThought.app.library.content.StateStore',
		'NextThought.app.library.content.components.Page',
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.courses.components.Page',
		'NextThought.app.store.StateStore',
		'NextThought.app.course.catalog.TabPanel',
		'NextThought.app.library.courses.components.available.CourseWindow'
	],


	layout: 'none',
	cls: 'library-view',

	items: [
		{xtype: 'box', autoEl: {html: 'library'}}
	],


	initComponent: function() {
		this.callParent(arguments);

		this.CourseViewActions = NextThought.app.course.Actions.create();
		this.BundleViewActions = NextThought.app.bundle.Actions.create();
		this.NavActions = NextThought.app.navigation.Actions.create();
		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.ContentStore = NextThought.app.library.content.StateStore.getInstance();
		this.PurchaseStore = NextThought.app.store.StateStore.getInstance();

		this.initRouter();


		this.addRoute('/catalog/courses/', this.showAvailableCourses.bind(this));
		this.addRoute('/catalog/books/', this.showAvailableBooks.bind(this));

		this.addDefaultRoute(this.showLibrary.bind(this));
	},


	getNavigation: function() {
		this.navigation = NextThought.app.library.components.Navigation.create({
			bodyView: this
		});

		return this.navigation;
	},


	showMyCourses: function(current) {
		this.removeAll(true);

		this.add({
			xtype: 'library-view-course-page',
			courses: current,
			navigate: this.navigateToCourse.bind(this)
		});
	},


	showMyAdminCourses: function(current) {
		this.removeAll(true);

		this.add({
			xtype: 'library-view-course-page',
			courses: current,
			navigate: this.navigateToCourse.bind(this)
		});
	},


	showMyBooks: function(bundles, packages) {
		this.removeAll(true);

		this.add({
			xtype: 'library-view-book-page',
			bundles: bundles,
			packages: packages,
			navigate: this.navigateToBundle.bind(this)
		});
	},


	showAvailableBooks: function() {},


	applyState: function(state) {
		var me = this;

		return Promise.all([
				me.CourseStore.onceLoaded(),
				me.ContentStore.onceLoaded(),
				me.PurchaseStore.onceLoaded()
			]).then(function() {
				var hasAvailableCourses = me.CourseStore.hasAllCoursesLink(),
					hasAvailablePurchases = me.PurchaseStore.getPurchasables().length > 0,
					active = state && state.active,
					current, options = [];

				if (me.CourseStore.getEnrolledCourses().length > 0 || hasAvailableCourses) {
					if (!active || active === 'courses') {
						current = {
							text: 'Your Courses',
							available: {
								enabled: hasAvailableCourses,
								text: 'Find Courses',
								title: 'Available Courses',
								route: '/catalog/courses/'
							}
						};

						me.showMyCourses(me.CourseStore.getEnrolledCourses());
					} else {
						options.push({
							text: 'Your Courses',
							type: 'courses'
						});
					}
				}

				if (me.CourseStore.getAdminCourses().length > 0) {
					if (active === 'admins') {
						current = {
							text: 'Your Administered Courses'
						};

						me.showMyAdminCourses(me.CourseStore.getAdminCourses());
					} else {
						options.push({
							text: 'Your Administered Courses',
							type: 'admins'
						});
					}
				}


				if (me.ContentStore.getContentBundles().length > 0 || me.ContentStore.getContentPackages().length > 0 || hasAvailablePurchases) {
					if (active === 'books') {
						current = {
							text: 'Your Books'
							//Comment this out for now
							// available: {
							// 	enabled: hasAvailablePurchases,
							// 	text: 'Find Books',
							// 	title: 'Available Books',
							// 	route: '/catalog/books/'
							// }
						};

						me.showMyBooks(me.ContentStore.getContentBundles(), me.ContentStore.getContentPackages());
					} else {
						options.push({
							text: 'Your Books',
							type: 'books'
						});
					}
				}

				me.navigation.updateState(current, options);
			});

	},


	showAvailable: function(title, route) {
		this.pushRoute(title, route);
	},


	__setActive: function(title) {
		var state = this.getCurrentState();

		this.NavActions.updateNavBar({
			cmp: this.getNavigation(),
			noLibraryLink: true
		});

		this.NavActions.setActiveContent(null);

		this.setTitle(title);

		return this.applyState(state);
	},


	showLibrary: function(route) {
		return this.__setActive('Library');
	},

	__showAvailableCourses: function() {
		var me = this;
		// Build the available courses window
		if (!this.availableWin) {
			this.availableWin = Ext.widget('library-available-courses-window', {});
			this.mon(this.availableWin, 'destroy', function() {
				delete me.availableWin;
			});
		}
		this.availableWin.show();
		return Promise.resolve(this.availableWin);
	},


	showAvailableCourses: function(route, subRoute) {
		var me = this;
		return this.__setActive('Available Courses')
			.then(this.__showAvailableCourses.bind(this))
			.then(function(win) {
				me.addChildRouter(win);
				if (win && win.handleRoute) {
					win.handleRoute(subRoute, route.precache);
				}
			});
	},


	showAvailableBooks: function(route, subRoute) {
		return this.__setActive('Available Books')
			.then(this.showAvailableBooks.bind(this))
			.then(function(win) {
				if (win && win.handleRoute) {
					win.handleRoute(subRoute);
				}
			});
	},


	navigateToCourse: function(enrollment, el) {
		var me = this,
			instance = enrollment.get('CourseInstance');

		me.CourseViewActions.transitionToCourse(instance, el)
			.then(function(route) {
				me.pushRootRoute(null, route, {course: instance});
			});
	},


	navigateToBundle: function(bundle, el) {
		var me = this;

		me.BundleViewActions.transitionToBundle(bundle, el)
			.then(function(route) {
				me.pushRootRoute(null, route, {bundle: bundle});
			});
	}
});
