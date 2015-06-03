Ext.define('NextThought.app.course.enrollment.Actions', {
	extend: 'NextThought.common.Actions',
	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.courses.Actions'
	],
	constructor: function() {
		this.courseStore = NextThought.app.library.courses.StateStore.getInstance();
		this.LibraryActions = NextThought.app.library.courses.Actions.create();
	},

	/**
	 * Either enrolls or drops a course
	 * @param  {CourseCatalogEntry}   course   the course to enroll or drop
	 * @param  {boolean}   enrolled   true to enroll false to drop
	 * @param  {Function} callback    what to do when its done, takes two arguments success,changed
	 */
	changeEnrollmentStatus: function(course, enrolled, callback) {
		var me = this,
			enrollmentStore = this.courseStore.getEnrolledCourses();

		this.courseStore.findEnrollmentForCourse(course.getId())
			.then(function(enrollment) {//enrolled
				//if we trying to enroll, and we are already enrolled no need to enroll again
				if (enrolled) {
					callback.call(null, true, false);
					return;
				}
				//if we aren't trying to enroll, and we already are drop the course
				me.toggleEnrollmentStatus(course, enrollment)
					.then(function() {
						var collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;

						course.setEnrolled(false);
						me.LibraryActions.setUpEnrolledCourses(collection).then(callback.bind(null, true, true));
					})
					.fail(function(reason) {
						console.error(reason);
						callback.call(null, false, false, reason && reason.status);
					});
			}, function() {
				//if we are trying to drop, and we aren't enrolled no need to drop
				if (!enrolled) {
					callback.call(null, true, false);
					return;
				}
				//if we are trying to enroll and we aren't
				me.toggleEnrollmentStatus(course)
					.then(function() {
						var collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;

						course.setEnrolled(true);
						me.LibraryActions.setUpEnrolledCourses(collection)
							.then(callback.bind(null, true, true));	
					})
					.fail(function(reason) {
						console.error(reason);
						callback.call(null, false);
					});
			});
	},


	toggleEnrollmentStatus: function(catelogEntry, enrollement) {
		var collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;
		if (enrollement) {
			return Service.requestDelete(enrollement.get('href'));
		}

		return Service.post(collection, {
			NTIID: catelogEntry.get('NTIID')
		});
	},


	courseEnrolled: function(fulfill, reject) {
		var me = this, 
			collection = (Service.getCollection('EnrolledCourses', 'Courses') || {}).href;

		me.LibraryActions.setUpEnrolledCourses(collection).then(fulfill).fail(reject);	
	},


	courseDropped: function(catalogEntry) {
		// this.enrollmentChanged();
		this.fireEvent('content-dropped', catalogEntry);
	}

});