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
	 * Drops a course
	 * @param  {CourseCatalogEntry}   course   the course to enroll or drop
	 * @param  {boolean}   enrolled   true to enroll false to drop
	 * @param  {Function} callback    what to do when its done, takes two arguments success,changed
	 */
	dropCourse: function(course, callback) {
		var me = this;
			enrollment = me.courseStore.findEnrollmentForCourse(course.getId());


		if (!enrollment) {
			callback.call(null, true, false);
			return;
		}

		me.__toggleEnrollmentStatus(course, enrollment)
			.then(function() {
				course.setEnrolled(false);
				me.refreshEnrolledCourses(callback.bind(null, true, true), function(reason) {
					console.error(reason);
					callback.call(null, false);
				});	
			});
	},

	/**
	 * Enrolls in a course
	 * @param  {CourseCatalogEntry}   course   the course to enroll or drop
	 * @param  {boolean}   enrolled   true to enroll false to drop
	 * @param  {Function} callback    what to do when its done, takes two arguments success,changed
	 */
	enrollCourse: function(course, callback) {
		var me = this;
			enrollment = me.courseStore.findEnrollmentForCourse(course.getId());

		//if we trying to enroll, and we are already enrolled no need to enroll again
		if (enrollment) {
			callback.call(null, true, false);
			return;
		}

		me.__toggleEnrollmentStatus(course)
			.then(function() {
				course.setEnrolled(true);
				me.refreshEnrolledCourses(callback.bind(null, true, true), function(reason) {
					console.error(reason);
					callback.call(null, false, false);
				});	
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

		me.LibraryActions.setUpEnrolledCourses(collection).then(fulfill).fail(reject || function(){});	
	},


	courseDropped: function(catalogEntry) {
		// this.enrollmentChanged();
		this.fireEvent('content-dropped', catalogEntry);
	}

});