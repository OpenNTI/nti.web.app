Ext.define('NextThought.app.library.courses.StateStore', {
	extend: 'NextThought.common.StateStore',

	ADMIN_COURSES: [],
	ENROLLED_COURSES: [],
	ALL_COURSES: [],


	getEnrolledCourses: function() { return this.ENROLLED_COURSES; },


	getAdminCourses: function() { return this.ADMIN_COURSES; },


	getAllCourses: function() {	return this.ALL_COURSES; },

	__updateCoursesEnrollmentState: function(courses) {
		courses.forEach(function(course){
			var catalog = course.getCourseCatalogEntry && course.getCourseCatalogEntry(),
				instance = course.get('CourseInstance'),
				isOpen = course.isOpen(),
				isAdmin = course instanceof NextThought.model.courses.CourseInstanceAdministrativeRole;

			if (catalog) {
				catalog.updateEnrollmentState(course.get('RealEnrollmentStatus') || course.get('Status'), isOpen, isAdmin);	
			}
		});
	},

	setEnrolledCourses: function(courses) {
		this.ENROLLED_COURSES = courses;
		this.__updateCoursesEnrollmentState(courses);
		this.fireEvent('enrolled-courses-set', this.ENROLLED_COURSES);
	},


	setAdministeredCourses: function(courses) {
		this.ADMIN_COURSES = courses;
		this.__updateCoursesEnrollmentState(courses);
		this.fireEvent('admin-courses-set', this.ADMIN_COURSES);
	},

	setAllCourses: function(courses) {
		this.ALL_COURSES = courses;

		this.fireEvent('all-courses-set', this.ALL_COURSES);
	},


	setAllCoursesLink: function(link) {
		this.all_courses_link = link;
	},


	getAllCoursesLink: function(link) {
		return this.all_courses_link;
	},


	hasAllCoursesLink: function() {
		return !!this.all_courses_link;
	},


	/**
	 * Filter the courses down to the ones that haven't expired yet
	 * @param  {Array} courses list of courses
	 * @return {Array}         courses in the list that haven't expired
	 */
	__getCurrentCourses: function(courses) {
		var current = [];

		courses.forEach(function(course) {
			var catalog = course.getCourseCatalogEntry ? course.getCourseCatalogEntry() : course;

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
			var catalog = course.getCourseCatalogEntry ? course.getCourseCatalogEntry() : course;

			if (!catalog || catalog.isExpired()) {
				archived.push(course);
			}
		});

		return archived;
	},


	/**
	 * Filter courses down to ones that haven't started yet
	 * @param  {Array} courses list of courses
	 * @return {Array} courses that haven't started
	 */
	__getUpcomingCourses: function(courses) {
		var upcoming = [];

		courses.forEach(function(course) {
			var catalog = course.getCourseCatalogEntry ? course.getCourseCatalogEntry() : course;
				start = catalog && catalog.get('StartDate'),
				end = catalog && catalog.get('EndDate'),
				now = new Date();

			if (catalog && start > now) {
				upcoming.push(course);
			}
		});

		return upcoming;
	},

	getAllCurrentCourses: function() {
		return this.__getCurrentCourses(this.ALL_COURSES);
	},

	getAllArchivedCourses: function() {
		return this.__getArchivedCourses(this.ALL_COURSES);
	},

	getAllUpcomingCourses: function() {
		return this.__getUpcomingCourses(this.ALL_COURSES);
	},

	getCurrentEnrolledCourses: function() {
		return this.__getCurrentCourses(this.ENROLLED_COURSES);
	},

	getArchivedEnrolledCourses: function() {
		return this.__getArchivedCourses(this.ENROLLED_COURSES);
	},

	getUpcomingEnrolledCourses: function() {
		return this.__getUpcomingCourses(this.ENROLLED_COURSES);
	},

	getCurrentAdminCourses: function() {
		return this.__getCurrentCourses(this.ADMIN_COURSES);
	},

	getArchivedAdminCourses: function() {
		return this.__getArchivedCourses(this.ADMIN_COURSES);
	},

	getUpcomingAdminCourses: function() {
		return this.__getUpcomingCourses(this.ADMIN_COURSES);
	},

	__findIn: function(list, fn) {
		var i, item = null;

		for (i = 0; i < list.length; i++) {
			if (fn.call(null, list[i])) {
				item = list[i];
			}
		}

		return item;
	},


	findCourseBy: function(fn) {
		var enrolled = this.ENROLLED_COURSES || [],
			admin = this.ADMIN_COURSES || [],
			i, course;

		course = this.__findIn(admin, fn);

		if (!course) {
			course = this.__findIn(enrolled, fn);
		}

		return course;
	},


	findEnrollmentForCourse: function(courseOrNtiid) {
		var ntiid = courseOrNtiid && courseOrNtiid.isModel ? courseOrNtiid.getId() : courseOrNtiid, me = this;

		function fn(rec) {
			var catalog = rec.getCourseCatalogEntry(),
				match = catalog.getId() === ntiid || catalog.get('OID') === ntiid;

			match = match || catalog.get('CourseEntryNTIID') === ntiid;
			return match;
		}

		return new Promise(function(fulfill, reject) {
			var match = me.__findIn(me.ENROLLED_COURSES, fn);
			if (match) {
				return fulfill(match);
			}

			return reject(match);
		});
	},

	findCourseForNtiid: function(ntiid) {
		function fn(rec) {
			//if ntiid is my id or my oid
			var match = rec.getId() === ntiid || rec.get('OID') === ntiid;
			//
			match = match || rec.get('CourseEntryNTIID') === ntiid;
			return match;
		}

		return this.__findIn(this.ALL_COURSES, fn);
	}
});
