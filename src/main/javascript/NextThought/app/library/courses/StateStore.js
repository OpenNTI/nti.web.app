Ext.define('NextThought.app.library.courses.StateStore', {
	extend: 'NextThought.common.StateStore',

	ADMIN_COURSES: [],
	ENROLLED_COURSES: [],
	ALL_COURSES: [],


	getEnrolledCourses: function() { return this.ENROLLED_COURSES; },


	getAdminCourses: function() { return this.ADMIN_COURSES; },


	setEnrolledCourses: function(courses) {
		this.ENROLLED_COURSES = courses;

		this.fireEvent('enrolled-courses-set', this.ENROLLED_COURSES);
	},


	setAdministeredCourses: function(courses) {
		this.ADMIN_COURSES = courses;

		this.fireEvent('admin-courses-set', this.ADMIN_COURSES);
	},

	/**
	 * Filter the courses down to the ones that haven't expired yet
	 * @param  {Array} courses list of courses
	 * @return {Array}         courses in the list that haven't expired
	 */
	__getCurrentCourses: function(courses) {
		var current = [];

		courses.forEach(function(course) {
			var catalog = course.getCourseCatalogEntry();

			if (catalog && !catalog.isExpired()) {
				current.push(course);
			}
		});

		return current;
	},

	/**
	 * Filter the courses down to ones that have expired
	 * @param  {Array} courses list of courses
	 * @return {Array}         courses in the list that are expired
	 */
	__getArchivedCourses: function(courses) {
		var archived = [];

		courses.forEach(function(course) {
			var catalog = course.getCourseCatalogEntry();

			if (!catalog || catalog.isExpired()) {
				archived.push(coure);
			}
		});

		return archived;
	},


	getCurrentEnrolledCourses: function() {
		return this.__getCurrentCourses(this.ENROLLED_COURSES);
	},


	getArchivedEnrolledCourses: function() {
		return this.__getArchivedCourses(this.ENROLLED_COURSES);
	},


	getCurrentAdminCourses: function() {
		return this.__getCurrentCourses(this.ADMIN_COURSES);
	},


	getArchivedAdminCourses: function() {
		return this.__getArchivedCourses(this.ADMIN_COURSES);
	}
});
