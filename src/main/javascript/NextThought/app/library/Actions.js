Ext.define('NextThought.app.library.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.StateStore',
		'NextThought.app.library.courses.Actions',
		'NextThought.login.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.CourseActions = NextThought.app.library.courses.Actions.create();

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		if (window.Service) {
			this.onLogin();
		} else {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var s = Service;

		this.CourseActions.setUpAdministeredCourses((s.getCollection('AdministeredCourses', 'Courses') || {}).href);
		this.CourseActions.setUpAllCourses((s.getCollection('AllCourses', 'Courses') || {}).href);
		this.CourseActions.setUpEnrolledCourses((s.getCollection('EnrolledCourses', 'Courses') || {}).href);
	}
});
