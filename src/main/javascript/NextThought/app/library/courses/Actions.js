Ext.define('NextThought.app.library.courses.Actions', {
	extend: 'NextThought.common.Actions',

	ADMIN_COURSES: [],
	ENROLLED_COURSES: [],
	ALL_COURSES: [],

	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.model.courses.CourseInstance',
		'NextThought.model.courses.CourseInstanceAdministrativeRole',
		'NextThought.util.Store'
	],


	constructor: function() {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
	},


	setUpAdministeredCourses: function(link) {},


	setUpEnrolledCourses: function(link) {},


	setUpAllCourses: function(link) {}
});
