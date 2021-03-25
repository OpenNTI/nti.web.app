const path = require('path');

const Ext = require('@nti/extjs');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const PathActions = require('internal/legacy/app/navigation/path/Actions');

const CoursesStateStore = require('../../library/courses/StateStore');
const CoursesActions = require('../../library/courses/Actions');

require('internal/legacy/common/Actions');

module.exports = exports = Ext.define(
	'NextThought.app.course.enrollment.Actions',
	{
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
			this.dropEnrollment(course, callback);
		},

		/**
		 * Drops a course
		 * @param  {CourseCatalogEntry} course the course to enroll or drop
		 * @param  {Function} callback what to do when its done, takes two arguments success,changed\
		 * @returns {void}
		 */
		async dropEnrollment(course, callback) {
			this.CourseStore.beforeDropCourse();

			try {
				await this.__toggleEnrollmentStatus(course, true);

				course.setEnrolled(false);

				const updateEnrolled = this.refreshEnrolledCourses();

				//Clear the library path caches since they may have changed
				this.PathActions.clearCache();

				await Promise.all([
					this.CourseActions.loadAllUpcomingCourses(),
					this.CourseActions.loadAllCurrentCourses(),
					this.CourseActions.loadAllArchivedCourses(),
					updateEnrolled,
				]);

				const loadedCourse = this.CourseStore.findCourseForNtiid(
					course.getId()
				);
				if (loadedCourse && course && loadedCourse !== course) {
					loadedCourse.setEnrolled(false);
					course = loadedCourse;
				}

				course.fireEvent('dropped');
				this.CourseStore.afterDropCourse();
				callback.call(null, true, true);
			} catch (response) {
				// console.error('Failed to enroll in course: ', response);
				const rawReason = response && response.responseText;
				const reason = (rawReason && JSON.parse(rawReason)) || {};
				reason.status = response && response.status;

				this.CourseStore.onDropCourseError();

				callback.call(null, false, false, reason);
			}
		},

		/**
		 * Enrolls in a course
		 * @param  {CourseCatalogEntry}	  course   the course to enroll or drop
		 * @param  {Function} callback	  what to do when its done, takes two arguments success,changed
		 * @returns {void}
		 */
		async enrollCourse(course, callback) {
			//if we trying to enroll, and we are already enrolled no need to enroll again
			if (!course.isEnrollable()) {
				callback.call(null, true, false);
				return;
			}

			this.CourseStore.beforeAddCourse();

			const parse = x => lazy.ParseUtils.parseItems(x)[0];

			try {
				const response = await this.__toggleEnrollmentStatus(course);

				const courseEnrollment = parse(response);

				course.setEnrolled(true);

				const catalogEntry = parse(
					await Service.request(
						courseEnrollment.getCourseCatalogEntry().get('href')
					)
				);

				course.set(
					'EnrollmentOptions',
					catalogEntry.get('EnrollmentOptions')
				);
				// this.CourseStore.updatedAvailableCourses();

				await this.refreshEnrolledCourses();

				//Clear the library path caches since they may have changed
				this.PathActions.clearCache();

				this.CourseStore.afterAddCourse();
				callback.call(null, true, true);
			} catch (reason) {
				callback.call(null, false, false);
			}
		},

		__toggleEnrollmentStatus: function (catalogEntry, drop) {
			var collection = (
				Service.getCollection('EnrolledCourses', 'Courses') || {}
			).href;

			if (drop) {
				return Service.requestDelete(
					path.join(
						collection,
						encodeURIComponent(catalogEntry.get('NTIID'))
					)
				);
			}

			return Service.post(collection, {
				NTIID: catalogEntry.get('NTIID'),
			});
		},

		async refreshEnrolledCourses(fulfill, reject) {
			const collection = (
				Service.getCollection('EnrolledCourses', 'Courses') || {}
			).href;

			try {
				//Call this when refreshing enrolled courses to
				//trigger the favorites to update
				this.CourseStore.afterAddCourse();

				const result = await this.CourseActions.setUpEnrolledCourses(
					collection
				);
				fulfill?.(result || true);
			} catch (reason) {
				reject?.(reason);
			}
		},

		courseDropped: function (catalogEntry) {
			// this.enrollmentChanged();
			this.fireEvent('content-dropped', catalogEntry);
		},
	}
);
