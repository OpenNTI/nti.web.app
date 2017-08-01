const Ext = require('extjs');

const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const CourseInstanceAdministrativeRole = require('legacy/model/courses/CourseInstanceAdministrativeRole');

const ALL_COURSES = 'AllCourses';
const ENROLLED_COURSES = 'EnrolledCourses';
const ADMINISTERED_COURSES = 'AdministeredCourses';

const CURRENT = 'Current';
const UPCOMING = 'Upcoming';
const ARCHIVED = 'Archived';

module.exports = exports = Ext.define('NextThought.app.library.courses.StateStore', {
	extend: 'NextThought.common.StateStore',

	FAVORITE_ENROLLED_COURSES: [],
	FAVORITE_ADMIN_COURSES: [],

	COURSE_ITEMS: {},
	COURSE_LOADING_MAP: {},
	COURSE_LOADED_MAP: {},

	TOTAL_ADMIN: 0,
	TOTAL_ENROLLED: 0,

	getEnrolledCourses: function () { return this.__getAllForLevel(ENROLLED_COURSES); },


	getAdminCourses: function () { return this.__getAllForLevel(ADMINISTERED_COURSES); },


	getAllCourses: function () { return this.__getAllForLevel(ALL_COURSES); },


	getFavoriteAdminCourses () {
		return this.FAVORITE_ADMIN_COURSES;
	},


	getFavoriteEnrolledCourses () {
		return this.FAVORITE_ENROLLED_COURSES;
	},


	__getAllForLevel (courseLevel) {
		if(!this.COURSE_ITEMS && !this.COURSE_ITEMS[courseLevel]) {
			return [];
		}

		let total = [];

		for(var key in this.COURSE_ITEMS[courseLevel]) {
			if(this.COURSE_ITEMS[courseLevel][key]) {
				total = total.concat(this.COURSE_ITEMS[courseLevel][key]);
			}
		}

		return total;
	},


	getTotalEnrolledCourses () {
		return this.TOTAL_ENROLLED;
	},


	getTotalAdminCourses () {
		return this.TOTAL_ADMIN;
	},


	addCourse (course) {
		// TODO: Add courses. How do we get the course end date to put in the correct partition?
	},

	__updateCoursesEnrollmentState: function (courses) {
		var me = this;

		(courses || []).forEach(function (course) {
			var precached = course.getCourseCatalogEntry(),
				ntiid = precached.getId(),
				catalog = me.findCourseForNtiid(ntiid),
				isOpen = course.isOpen(),
				isAdmin = course instanceof CourseInstanceAdministrativeRole;

			if (catalog) {
				catalog.set('enrolled', precached.get('enrolled'));
				catalog.set('EnrollmentOptions', precached.get('EnrollmentOptions'));
				catalog.updateEnrollmentState(course.get('RealEnrollmentStatus') || course.get('Status'), isOpen, isAdmin);
			}

			if (precached) {
				precached.updateEnrollmentState(course.get('RealEnrollmentStatus') || course.get('Status'), isOpen, isAdmin);
			}
		});
	},


	setFavoriteEnrolledCourses (courses) {
		this.FAVORITE_ENROLLED_COURSES = courses;
		this.__updateCoursesEnrollmentState(courses);
		this.fireEvent('favorite-enrolled-courses-set', this.FAVORITE_ENROLLED_COURSES);
	},


	setFavoriteAdminCourses (courses) {
		this.FAVORITE_ADMIN_COURSES = courses;
		this.__updateCoursesEnrollmentState(courses);
		this.fireEvent('favorite-admin-courses-set', this.FAVORITE_ADMIN_COURSES);
	},


	setAllCourses: function (courses) {
		this.fireEvent('all-courses-set', courses);
	},


	setTotalAdminCount (count) {
		this.TOTAL_ADMIN = count;
	},


	setTotalEnrolledCount (count) {
		this.TOTAL_ENROLLED = count;
	},


	updatedAvailableCourses: function () {
		this.fireEvent('update-available-courses');
	},


	setAllCoursesLink: function (link) {
		this['all_courses_link'] = link;
	},


	getAllCoursesLink: function (link) {
		return this['all_courses_link'];
	},


	hasAllCoursesLink: function () {
		return !!this['all_courses_link'];
	},


	__getCoursesOfType: function (courseLevel, courseType) {
		return this.COURSE_ITEMS[courseLevel] && this.COURSE_ITEMS[courseLevel][courseType];
	},

	getAllCurrentCourses: function () {
		return this.__getCoursesOfType(ALL_COURSES, CURRENT);
	},

	getAllArchivedCourses: function () {
		return this.__getCoursesOfType(ALL_COURSES, ARCHIVED);
	},

	getAllUpcomingCourses: function () {
		return this.__getCoursesOfType(ALL_COURSES, UPCOMING);
	},

	getCurrentEnrolledCourses: function () {
		return this.__getCoursesOfType(ENROLLED_COURSES, CURRENT);
	},

	getArchivedEnrolledCourses: function () {
		return this.__getCoursesOfType(ENROLLED_COURSES, ARCHIVED);
	},

	getUpcomingEnrolledCourses: function () {
		return this.__getCoursesOfType(ENROLLED_COURSES, UPCOMING);
	},

	getCurrentAdminCourses: function () {
		return this.__getCoursesOfType(ADMINISTERED_COURSES, CURRENT);
	},

	getArchivedAdminCourses: function () {
		return this.__getCoursesOfType(ADMINISTERED_COURSES, ARCHIVED);
	},

	getUpcomingAdminCourses: function () {
		return this.__getCoursesOfType(ADMINISTERED_COURSES, UPCOMING);
	},

	__findIn: function (list, fn) {
		var i, item = null;

		for (i = 0; i < list.length; i++) {
			if (fn.call(null, list[i])) {
				item = list[i];
				break;
			}
		}

		return item;
	},


	__findAllIn: function (list, fn) {
		return list.reduce(function (acc, item) {
			if (fn.call(null, item)) {
				acc.push(item);
			}

			return acc;
		}, []);
	},


	findCourseBy: function (fn) {
		var enrolled = this.__getAllForLevel(ENROLLED_COURSES) || [],
			admin = this.__getAllForLevel(ADMINISTERED_COURSES) || [],
			course;

		course = this.__findIn(admin, fn);

		if (!course) {
			course = this.__findIn(enrolled, fn);
		}

		return course;
	},


	findCoursesBy: function (fn) {
		var enrolled = this.__findAllIn(this.__getAllForLevel(ENROLLED_COURSES) || [], fn),
			admin = this.__findAllIn(this.__getAllForLevel(ADMINISTERED_COURSES) || [], fn);

		return admin.concat(enrolled);
	},


	findEnrollmentForCourse: function (courseOrNtiid) {
		var ntiid = courseOrNtiid && courseOrNtiid.isModel ? courseOrNtiid.getId() : courseOrNtiid,
			me = this;

		function fn (rec) {
			var catalog = rec.getCourseCatalogEntry(),
				match = catalog.getId() === ntiid || catalog.get('OID') === ntiid;

			match = match || catalog.get('CourseEntryNTIID') === ntiid;
			return match;
		}

		const enrolled = me.__findIn(this.__getAllForLevel(ENROLLED_COURSES), fn);

		return enrolled ? enrolled : me.__findIn(me.FAVORITE_ENROLLED_COURSES, fn);
	},

	findCourseForNtiid: function (ntiid) {
		function fn (rec) {
			//if ntiid is my id or my oid
			var match = rec.getId() === ntiid || rec.get('OID') === ntiid;
			//
			match = match || rec.get('CourseEntryNTIID') === ntiid;
			return match;
		}

		return this.__findIn(this.__getAllForLevel(ALL_COURSES), fn);
	},


	findCourseInstance: function (ntiid) {
		function fn (rec) {
			var instance = rec.get('CourseInstance');

			return instance.get('NTIID') === ntiid || rec.get('NTIID') === ntiid;
		}

		var enrollment = this.__findIn(this.__getAllForLevel(ENROLLED_COURSES), fn);

		if (!enrollment) {
			enrollment = this.__findIn(this.__getAllForLevel(ADMINISTERED_COURSES), fn);
		}

		return enrollment && enrollment.get('CourseInstance');
	},


	findCourseInstanceByPriority: function (fn) {
		var priorities = {},
			keys = [],
			result = [];

		function find (enrollment) {
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


		this.__findIn(this.__getAllForLevel(ENROLLED_COURSES), find);
		this.__findIn(this.__getAllForLevel(ADMINISTERED_COURSES), find);

		keys.sort();

		keys.forEach(function (key) {
			result = result.concat(priorities[key]);
		});

		return Promise.resolve(result);
	},


	__containsNTIID: function (rec, prefix) {
		var match = false;

		rec.getContentPackages().every(function (contentPackage) {
			var id = contentPackage.get('NTIID');

			match = match || (prefix && prefix === lazy.ParseUtils.ntiidPrefix(id));
		});

		return match;
	},


	findForNTIID: function (id) {
		var me = this,
			prefix = lazy.ParseUtils.ntiidPrefix(id),
			course;

		function fn (rec) {
			rec = rec.get('CourseInstance');

			//if the id is my id or oid
			let match = rec.getId() === id || rec.get('OID') === id;
			let courseCatalog = rec.getCourseCatalogEntry();

			match = match || (courseCatalog && courseCatalog.getId() === id);

			match = match || rec.get('CourseEntryNTIID') === id;

			return match || me.__containsNTIID(rec, prefix);
		}

		course = me.__findIn(this.__getAllForLevel(ENROLLED_COURSES), fn);

		if (!course) {
			course = me.__findIn(this.__getAllForLevel(ADMINISTERED_COURSES), fn);
		}

		if (course) {
			return Promise.resolve(course.get('CourseInstance'));
		}

		return Promise.reject();
	},


	getMostRecentEnrollmentCourse: function () {
		var enrolledCourses = this.getEnrolledCourses() || [],
			enrollment = enrolledCourses[0];

		enrolledCourses.forEach(function (e) {
			if (e.get('CreatedTime') > enrollment.get('CreatedTime')) {
				enrollment = e;
			}
		});

		return enrollment && enrollment.getCourseCatalogEntry();
	},


	hasCourse: function (course) {
		var ntiid = course.get('NTIID');

		var found = this.findCourseBy(function (enrollment) {
			var instance = enrollment.get('CourseInstance'),
				instanceId = instance.getId() || '',
				enrollmentId = enrollment.get('NTIID') || '';

			return instanceId === ntiid || enrollmentId === ntiid;
		});

		return !!found;
	},

	/**
	 * Return all courses in the same catalog family
	 * @param  {String} familyId id of the catalog family to search for
	 * @return {[Course]}		 list of courses in the same catalog family
	 */
	findForCatalogFamily: function (familyId) {
		return this.findCoursesBy(function (course) {
			var instance = course.get('CourseInstance');

			return instance.isInFamily(familyId);
		});
	},


	isTypeLoading (courseLevel, courseType) {
		return(this.COURSE_LOADING_MAP[courseLevel] && this.COURSE_LOADING_MAP[courseLevel][courseType]);
	},


	setTypeLoading (courseLevel, courseType) {
		if(!this.COURSE_LOADING_MAP[courseLevel]) {
			this.COURSE_LOADING_MAP[courseLevel] = {};
		}

		this.COURSE_LOADING_MAP[courseLevel][courseType] = true;
	},


	setTypeLoaded (courseLevel, courseType) {
		if(!this.COURSE_LOADED_MAP[courseLevel]) {
			this.COURSE_LOADED_MAP[courseLevel] = {};
		}

		this.COURSE_LOADED_MAP[courseLevel][courseType] = true;

		delete this.COURSE_LOADING_MAP[courseLevel][courseType];
		this.fireEvent(courseLevel.toLowerCase() + '-' + courseType.toLowerCase() + '-loaded');
	},


	onceTypeLoaded (courseLevel, courseType, force) {
		if (this.COURSE_LOADED_MAP[courseLevel] && this.COURSE_LOADED_MAP[courseLevel][courseType] && !force) {
			return Promise.resolve(this);
		}

		delete this.COURSE_LOADED_MAP[courseLevel][courseType];

		this.fireEvent('load-' + courseLevel + '-' + courseType);

		const event = courseLevel.toLowerCase() + '-' + courseType.toLowerCase() + '-loaded';

		return new Promise((fulfill) => {
			this.on({
				single: true,
				[event]: () => fulfill(this)
			});
		});
	},

	__updateEnrollment (items) {
		items.forEach((item) => {
			const openEnrollment = item.get('EnrollmentOptions') && item.get('EnrollmentOptions').get('Items')
				&& item.get('EnrollmentOptions').get('Items').OpenEnrollment;

			const enrolled = openEnrollment && openEnrollment.IsEnrolled;
			const isOpen = openEnrollment && openEnrollment.IsAvailable;
			const isAdmin = item.get('isAdmin');

			item.set('enrolled', enrolled || isAdmin);
			item.set('isOpen', isOpen);
		});
	},

	setCoursesByType (courseLevel, courseType, items) {
		if(!this.COURSE_ITEMS[courseLevel]) {
			this.COURSE_ITEMS[courseLevel] = {};
		}

		this.__updateEnrollment(items);

		this.COURSE_ITEMS[courseLevel][courseType] = items;
	},


	isFavoritesLoading () {
		return this.favoritesLoading;
	},


	setFavoritesLoading () {
		this.favoritesLoading = true;
	},


	setFavoritesLoaded () {
		this.favoritesLoaded = true;
		delete this.favoritesLoading;
		this.fireEvent('favorites-loaded');
	},


	onceFavoritesLoaded (force) {
		if (this.favoritesLoaded && !force) {
			return Promise.resolve(this);
		}

		delete this.favoritesLoaded;

		this.fireEvent('load-favorites');

		return new Promise((fulfill) => {
			this.on({
				single: true,
				'favorites-loaded': () => fulfill(this)
			});
		});
	},


	beforeDropCourse () {
		this.fireEvent('dropping-course');
	},


	afterDropCourse () {
		this.fireEvent('dropped-course');
	},


	beforeAddCourse () {
		this.fireEvent('adding-course');
	},


	afterAddCourse () {
		this.fireEvent('added-course');
	}
});
