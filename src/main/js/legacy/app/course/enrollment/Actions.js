const Ext = require('extjs');
const {wait} = require('nti-commons');

const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const PathActions = require('legacy/app/navigation/path/Actions');

const CoursesStateStore = require('../../library/courses/StateStore');
const CoursesActions = require('../../library/courses/Actions');

require('legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.course.enrollment.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.CourseStore = CoursesStateStore.getInstance();
		this.CourseActions = CoursesActions.create();
		this.PathActions = PathActions.create();
	},

	/**
	 * Drops a course
	 * @param  {CourseCatalogEntry}	  course   the course to enroll or drop
	 * @param  {Function} callback	  what to do when its done, takes two arguments success,changed
	 * @returns {void}
	 */
	dropCourse: function (course, callback) {
		var me = this,
			enrollment = me.CourseStore.findEnrollmentForCourse(course.getId());

		if (!enrollment) {
			callback.call(null, true, false);
			return;
		}

		this.dropEnrollment(course, enrollment, callback);
	},

	/**
	 * Drops a course
	 * @param  {CourseCatalogEntry} course the course to enroll or drop
	 * @param  {Object} enrollment course enrollement object
	 * @param  {Function} callback what to do when its done, takes two arguments success,changed\
	 * @returns {void}
	 */
	dropEnrollment: function (course, enrollment, callback) {
		var me = this;

		me.CourseStore.beforeDropCourse();

		me.__toggleEnrollmentStatus(course, enrollment)
			.then(function () {
				var updateEnrolled;

				wait(500).then(() =>  course.fireEvent('dropped'));

				updateEnrolled = new Promise(function (fulfill, reject) {
					me.refreshEnrolledCourses(fulfill.bind(null, true), fulfill.bind(null, false));
				});

				//Clear the library path caches since they may have changed
				me.PathActions.clearCache();

				Promise.all([
					course.updateFromServer(),
					me.CourseActions.loadAllUpcomingCourses(),
					me.CourseActions.loadAllCurrentCourses(),
					me.CourseActions.loadAllArchivedCourses(),
					updateEnrolled
				]).then(function (results) {
					var success = results[3];

					if (success) {
						const loadedCourse = me.CourseStore.findCourseForNtiid(course.getId());
						if (loadedCourse && course && loadedCourse !== course) {
							loadedCourse.setEnrolled(false);
							course = loadedCourse;
						}
					}

					me.CourseStore.afterDropCourse();
					callback.call(null, success, true);
				}).catch(function (reason) {
					console.error('Failed to enroll in course: ', reason);
				});
			}).catch(function (reason) {
				console.error('Failed to enroll in course: ', reason);

				callback.call(null, false, false);
			});
	},

	/**
	 * Enrolls in a course
	 * @param  {CourseCatalogEntry}	  course   the course to enroll or drop
	 * @param  {Function} callback	  what to do when its done, takes two arguments success,changed
	 * @returns {void}
	 */
	enrollCourse: function (course, callback) {
		const me = this;
		const enrollment = me.CourseStore.findEnrollmentForCourse(course.getId());

		//if we trying to enroll, and we are already enrolled no need to enroll again
		if (enrollment) {
			callback.call(null, true, false);
			return;
		}

		me.CourseStore.beforeAddCourse();

		me.__toggleEnrollmentStatus(course)
			.then(function (response) {
				var updateCatalog, updateEnrolled,
					courseEnrollment = lazy.ParseUtils.parseItems(response)[0],
					courseInstance = courseEnrollment.get('CourseInstance');

				course.setEnrolled(true);

				updateCatalog = Service.request(courseInstance.getLink('CourseCatalogEntry'))
					.then(function (catalogEntry) {
						catalogEntry = lazy.ParseUtils.parseItems(catalogEntry)[0];

						course.set('EnrollmentOptions', catalogEntry.get('EnrollmentOptions'));
						// me.CourseStore.updatedAvailableCourses();
					});

				updateEnrolled = new Promise(function (fulfill, reject) {
					me.refreshEnrolledCourses(fulfill.bind(null, true), fulfill.bind(null, false));
				});

				//Clear the library path caches since they may have changed
				me.PathActions.clearCache();

				Promise.all([
					updateCatalog,
					updateEnrolled
				]).then(function (results) {
					var success = results[1];

					me.CourseStore.afterAddCourse();
					callback.call(null, success, true);
				}).catch(function (reason) {
					console.error('Failed to enroll in course: ', reason);
				});
			})
			.catch(function (reason) {
				console.error('Failed to enroll in course: ', reason);

				callback.call(null, false, false);
			});
	},

	__toggleEnrollmentStatus: function (catelogEntry, enrollement) {
		var collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;

		if (enrollement) {
			return Service.requestDelete(enrollement.get('href'));
		}

		return Service.post(collection, {
			NTIID: catelogEntry.get('NTIID')
		});
	},

	refreshEnrolledCourses: function (fulfill, reject) {
		var me = this,
			collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;

		reject = reject || function () {};

		//Call this when refreshing enrolled courses to
		//trigger the favorites to update
		me.CourseStore.afterAddCourse();

		me.CourseActions.setUpEnrolledCourses(collection)
			.then(fulfill)
			.catch(reject);
	},

	courseDropped: function (catalogEntry) {
		// this.enrollmentChanged();
		this.fireEvent('content-dropped', catalogEntry);
	}
});
