var Ext = require('extjs');
var ParseUtils = require('../../../util/Parsing');
var CommonActions = require('../../../common/Actions');
var CoursesStateStore = require('../../library/courses/StateStore');
var CoursesActions = require('../../library/courses/Actions');
var PathActions = require('../../navigation/path/Actions');


module.exports = exports = Ext.define('NextThought.app.course.enrollment.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function() {
		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.CourseActions = NextThought.app.library.courses.Actions.create();
		this.PathActions = NextThought.app.navigation.path.Actions.create();
	},

	/**
	 * Drops a course
	 * @param  {CourseCatalogEntry}	  course   the course to enroll or drop
	 * @param  {boolean}   enrolled	  true to enroll false to drop
	 * @param  {Function} callback	  what to do when its done, takes two arguments success,changed
	 */
	dropCourse: function(course, callback) {
		var me = this;
			enrollment = me.CourseStore.findEnrollmentForCourse(course.getId()),
			courseHref = course.get('href');


		if (!enrollment) {
			callback.call(null, true, false);
			return;
		}

		me.__toggleEnrollmentStatus(course, enrollment)
			.then(function() {
				var updateCatalog, updateEnrolled;

				course.setEnrolled(false);
				updateCatalog = me.CourseActions.loadAllCourses();

				updateEnrolled = new Promise(function(fulfill, reject) {
					me.refreshEnrolledCourses(fulfill.bind(null, true), fulfill.bind(null, false));
				});

				//Clear the library path caches since they may have changed
				me.PathActions.clearCache();

				Promise.all([
					updateCatalog,
					updateEnrolled
				]).then(function(results) {
					var success = results[1];

					callback.call(null, success, true);
				}).fail(function(reason) {
					console.error('Failed to enroll in course: ', reason);
				});
			}).fail(function(reason) {
				console.error('Failed to enroll in course: ', reason);

				callback.call(null, false, false);
			});

	},

	/**
	 * Enrolls in a course
	 * @param  {CourseCatalogEntry}	  course   the course to enroll or drop
	 * @param  {boolean}   enrolled	  true to enroll false to drop
	 * @param  {Function} callback	  what to do when its done, takes two arguments success,changed
	 */
	enrollCourse: function(course, callback) {
		var me = this;
			enrollment = me.CourseStore.findEnrollmentForCourse(course.getId()),
			courseHref = course.get('href');

		//if we trying to enroll, and we are already enrolled no need to enroll again
		if (enrollment) {
			callback.call(null, true, false);
			return;
		}

		me.__toggleEnrollmentStatus(course)
			.then(function(response) {
				var updateCatalog, updateEnrolled,
				courseEnrollment = ParseUtils.parseItems(response)[0],
				courseInstance = courseEnrollment.get('CourseInstance');

				course.setEnrolled(true);

				updateCatalog = Service.request(courseInstance.getLink('CourseCatalogEntry'))
					.then(function(catalogEntry) {
						catalogEntry = ParseUtils.parseItems(catalogEntry)[0];

						course.set('EnrollmentOptions', catalogEntry.get('EnrollmentOptions'));
						// me.CourseStore.updatedAvailableCourses();
					});

				updateEnrolled = new Promise(function(fulfill, reject) {
					me.refreshEnrolledCourses(fulfill.bind(null, true), fulfill.bind(null, false));
				});

				//Clear the library path caches since they may have changed
				me.PathActions.clearCache();

				Promise.all([
					updateCatalog,
					updateEnrolled
				]).then(function(results) {
					var success = results[1];

					callback.call(null, success, true);
				}).fail(function(reason) {
					console.error('Failed to enroll in course: ', reason);
				});
			})
			.fail(function(reason) {
				console.error('Failed to enroll in course: ', reason);

				callback.call(null, false, false);
			});
	},

	__toggleEnrollmentStatus: function(catelogEntry, enrollement) {
		var collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;
		if (enrollement) {
			return Service.requestDelete(enrollement.get('href'));
		}

		return Service.post(collection, {
			NTIID: catelogEntry.get('NTIID')
		});
	},

	refreshEnrolledCourses: function(fulfill, reject) {
		var me = this,
			collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;

		reject = reject || function() {};

		me.CourseActions.setUpEnrolledCourses(collection)
			.then(fulfill)
			.fail(reject);
	},

	courseDropped: function(catalogEntry) {
		// this.enrollmentChanged();
		this.fireEvent('content-dropped', catalogEntry);
	}
});
