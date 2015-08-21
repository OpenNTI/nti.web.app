Ext.define('NextThought.app.library.courses.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.library-courses',

	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.courses.components.Page',
		'NextThought.app.course.Actions'
	],

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',
	cls: 'library-page',

	items: [{
		xtype: 'box',
		cls: 'title',
		autoEl: {html: 'My Courses'}
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
				me.loadCourses();
			}
		});
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


	loadCourses: function() {
		var me = this;

		me.loadingCmp = me.loadingCmp || me.add({
			xtype: 'box',
			cls: 'loading',
			autoEl: {cls: 'loaiding-text', html: 'Loading...'}
		});

		return me.CourseStore.onceLoaded()
				.then(function() {
					var upcomingCourses = me.__getUpcomingCourses(),
						currentCourses = me.__getCurrentCourses(),
						archivedCourses = me.__getArchivedCourses();

					if (me.loadingCmp) {
						me.remove(me.loadingCmp, true);
					}

					if (!upcomingCourses.length && !currentCourses.length && !archivedCourses.length) {
						return me.showEmptyState();
					}

					if (me.coursePage) {
						me.coursePage.setItems(upcomingCourses, currentCourses, archivedCourses);
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
		return this.loadCourses();
	},


	showAvailableCourses: function(route, subRoute) {},


	navigateToCourse: function(enrollment, el) {
		var me = this,
			instance = enrollment.get('CourseInstance');

		me.CourseViewActions.transitionToCourse(instance, el)
			.then(function(route) {
				me.pushRootRoute(null, route, {course: instance});
			});
	}
});
