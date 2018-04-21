const Ext = require('@nti/extjs');

const CoursesStateStore = require('../library/courses/StateStore');

require('legacy/common/StateStore');


module.exports = exports = Ext.define('NextThought.app.course.StateStore', {
	extend: 'NextThought.common.StateStore',

	constructor: function () {
		this.ROUTES = {};
		this.CourseStore = CoursesStateStore.getInstance();

		this.callParent(arguments);
	},


	markRouteFor: function (id, route) {
		this.ROUTES[id] = route;
	},


	getRouteFor: function (id) {
		return this.ROUTES[id];
	},

	addCourse: function (course) {
		var courses = this.CourseStore.getEnrolledCourses();

		if(courses.length === 0 || !courses.includes(course)) {
			courses.push(course);
			this.CourseStore.__updateCoursesEnrollmentState(courses);
			this.fireEvent('enrolled-courses-set', courses);
		}
	}
});
