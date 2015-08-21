Ext.define('NextThought.app.library.admin.Index', {
	extend: 'NextThought.app.library.courses.Index',
	alias: 'widget.library-admin',

	mixins: {
		Router: 'NextThought.mixins.Router'
	},

	layout: 'none',

	items: [{
		xtype: 'box',
		cls: 'title',
		autoEl: {html: 'My Courses'}
	}],


	__getUpcomingCourses: function() {
		return this.CourseStore.getUpcomingAdminCourses();
	},


	__getCurrentCourses: function() {
		return this.CourseStore.getCurrentAdminCourses();
	},


	__getArchivedCourses: function() {
		return this.CourseStore.getArchivedAdminCourses();
	},


	showAvailableCourses: function(route, subRoute) {}
});
