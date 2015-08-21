Ext.define('NextThought.app.library.courses.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-courses',

	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.courses.components.Page',
		'NextThought.app.course.Actions',
		'NextThought.app.library.courses.components.available.CourseWindow'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	cls: 'library-page',

	items: [{
		xtype: 'box',
		cls: 'title-container',
		autoEl: {cn: [
			{cls: 'title', html: 'Courses'},
			{cls: 'add-more-link hidden', html: 'Add'}
		]}
	}],


	initComponent: function() {
		this.callParent(arguments);

		var me = this;

		me.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		me.CourseViewActions = NextThought.app.course.Actions.create();

		me.addRoute('/', me.showCourses.bind(me));
		me.addRoute('/available', me.showAvailableCourses.bind(me));
		me.addDefaultRoute('/');

		me.mon(me.CourseStore, 'enrolled-courses-set', function() {
			if (me.isVisible) {
				me.loadCourses(true);
			}
		});

		me.on({
			deactivate: me.onDeactivate.bind(me)
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));

		var addMoreLink = this.el.down('.add-more-link');

		if (this.CourseStore.hasAllCoursesLink() && addMoreLink) {
			addMoreLink.removeCls('hidden');
		}
	},


	onDeactivate: function() {
		if (this.availableWin) {
			this.availableWin.destroy();
		}
	},


	__getUpcomingCourses: function() {
		return this.CourseStore.getUpcomingEnrolledCourses();
	},


	__getCurrentCourses: function() {
		return this.CourseStore.getCurrentEnrolledCourses();
	},


	__getArchivedCourses: function() {
		return this.CourseStore.getArchivedEnrolledCourses();
	},


	loadCourses: function(force) {
		var me = this;

		me.loadingCmp = me.loadingCmp || me.add({
			xtype: 'box',
			autoEl: {cls: 'loading-mask', cn: {cls: 'load-text', html: 'Loading...'}}
		});

		return me.CourseStore.onceLoaded()
				.then(function() {
					var upcomingCourses = me.__getUpcomingCourses(),
						currentCourses = me.__getCurrentCourses(),
						archivedCourses = me.__getArchivedCourses();

					if (me.loadingCmp) {
						me.remove(me.loadingCmp, true);
						delete me.loadingCmp;
					}

					if (!upcomingCourses.length && !currentCourses.length && !archivedCourses.length) {
						return me.showEmptyState();
					}

					if (me.emptyText) {
						me.remove(me.emptyText, true);
						delete me.emptyText;
					}

					if (me.coursePage) {
						if (force) {
							me.coursePage.setItems(upcomingCourses, currentCourses, archivedCourses);
						}
					} else {
						me.coursePage = me.add({
							xtype: 'library-view-course-page',
							upcoming: upcomingCourses,
							current: currentCourses,
							archived: archivedCourses,
							navigate: me.navigateToCourse.bind(me)
						});
					}
				});
	},


	showCourses: function(route, subRoute) {
		this.setTitle('Your Courses');

		if (this.availableWin) {
			this.availableWin.destroy();
			delete this.availableWin;
		}

		return this.loadCourses();
	},


	showAvailableCourses: function(route, subRoute) {
		var me = this;

		if (!me.availableWin) {
			me.availableWin = Ext.widget('library-available-courses-window', {
				doClose: me.pushRoute.bind(me, 'You Courses', '/')
			});

			me.mon(me.availableWin, 'destroy', function() {
				delete me.availableWin;
			});
		}

		me.loadCourses();
		me.availableWin.show();
		me.setTitle('All Courses');

		me.addChildRouter(me.availableWin);
		if (me.availableWin && me.availableWin.handleRoute) {
			return me.availableWin.handleRoute(subRoute, route.precache);
		}
	},


	showEmptyState: function() {
		if (this.coursePage) {
			this.remove(this.coursePage, true);
			delete this.coursePage;
		}

		this.emptyText = this.emptyText || this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-text', html: 'You don\'t have any courses yet...<br><a class="add-more-link">+ Add Courses</a>'}
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


	onClick: function(e) {
		if (e.getTarget('.add-more-link')) {
			this.pushRoute('Available', '/available');
		}
	}
});
