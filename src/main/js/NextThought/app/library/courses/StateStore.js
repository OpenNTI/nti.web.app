export default Ext.define('NextThought.app.library.courses.StateStore', {
	extend: 'NextThought.common.StateStore',

	ADMIN_COURSES: [],
	ENROLLED_COURSES: [],
	ALL_COURSES: [],


	getEnrolledCourses: function() { return this.ENROLLED_COURSES; },


	getAdminCourses: function() { return this.ADMIN_COURSES; },


	getAllCourses: function() {	return this.ALL_COURSES; },

	__updateCoursesEnrollmentState: function(courses) {
		var me = this;

		courses.forEach(function(course) {
			var precached = course.getCourseCatalogEntry(),
				ntiid = precached.getId(),
				catalog = me.findCourseForNtiid(ntiid),
				instance = course.get('CourseInstance'),
				isOpen = course.isOpen(),
				isAdmin = course instanceof NextThought.model.courses.CourseInstanceAdministrativeRole;

			if (catalog) {
				catalog.set('enrolled', precached.get('enrolled'));
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

		//Update catalog entries for enrolled and admin courses.
		this.__updateCoursesEnrollmentState(this.ENROLLED_COURSES);
		this.__updateCoursesEnrollmentState(this.ADMIN_COURSES);

		this.fireEvent('all-courses-set', this.ALL_COURSES);
	},


	updatedAvailableCourses: function() {
			this.fireEvent('update-available-courses');
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

			if (catalog && catalog.isCurrent()) {
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

			if (!catalog || catalog.isArchived()) {
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

			if (catalog && catalog.isUpcoming()) {
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
				break;
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
		var ntiid = courseOrNtiid && courseOrNtiid.isModel ? courseOrNtiid.getId() : courseOrNtiid,
			me = this, match;

		function fn(rec) {
			var catalog = rec.getCourseCatalogEntry(),
				match = catalog.getId() === ntiid || catalog.get('OID') === ntiid;

			match = match || catalog.get('CourseEntryNTIID') === ntiid;
			return match;
		}

		return me.__findIn(me.ENROLLED_COURSES, fn);
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
	},


	findCourseInstance: function(ntiid) {
		function fn(rec) {
			var instance = rec.get('CourseInstance');

			return instance.get('NTIID') === ntiid || rec.get('NTIID') === ntiid;
		}

		var enrollment = this.__findIn(this.ENROLLED_COURSES, fn);

		if (!enrollment) {
			enrollment = this.__findIn(this.ADMIN_COURSES, fn);
		}

		return enrollment && enrollment.get('CourseInstance');
	},


	findCourseInstanceByPriority: function(fn) {
		var priorities = {},
			keys = [],
			result = [];

		function find(enrollment) {
			var instance = enrollment.get('CourseInstance'),
				priority = fn.call(null, instance, enrollment);

			if (priority && priority > 0) {
				if (priorities[priority]) {
					priorities[priority].push(instance);
				} else {
					keys.push(priority);
					priorities[priority] = [instance];
				}
			}

			return false;
		}


		this.__findIn(this.ENROLLED_COURSES, find);
		this.__findIn(this.ADMIN_COURSES, find);

		keys.sort();

		keys.forEach(function(key) {
			result = result.concat(priorities[key]);
		});

		return Promise.resolve(result);
	},


	__containsNTIID: function(rec, prefix) {
		var match = false;

		rec.getContentPackages().every(function(contentPackage) {
			var id = contentPackage.get('NTIID');

			match = match || (prefix && prefix === ParseUtils.ntiidPrefix(id));
		});

		return match;
	},


	findForNTIID: function(id) {
		var me = this,
			prefix = ParseUtils.ntiidPrefix(id),
			course;

		function fn(rec) {
			rec = rec.get('CourseInstance');

			//if the id is my id or oid
			var match = rec.getId() === id || rec.get('OID') === id;

			match = match || rec.get('CourseEntryNTIID') === id;

			return match || me.__containsNTIID(rec, prefix);
		}

		course = me.__findIn(me.ENROLLED_COURSES, fn);

		if (!course) {
			course = me.__findIn(me.ADMIN_COURSES, fn);
		}

		if (course) {
			return Promise.resolve(course.get('CourseInstance'));
		}

		return Promise.reject();
	},


	getMostRecentEnrollmentCourse: function() {
		var enrolledCourses = this.getEnrolledCourses() || [],
			enrollment = enrolledCourses[0];

		enrolledCourses.forEach(function(e) {
			if (e.get('CreatedTime') > enrollment.get('CreatedTime')) {
				enrollment = e;
			}
		});

		return enrollment && enrollment.getCourseCatalogEntry();
	},


	hasCourse: function(course) {
		var ntiid = course.get('NTIID');

		var found = this.findCourseBy(function(enrollment) {
			var instance = enrollment.get('CourseInstance'),
				instanceId = instance.getId() || '',
				enrollmentId = enrollment.get('NTIID') || '';

			return instanceId === ntiid || enrollmentId === ntiid;
		});

		return !!found;
	}
});
