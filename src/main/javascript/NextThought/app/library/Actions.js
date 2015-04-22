Ext.define('NextThought.app.library.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.StateStore',
		'NextThought.app.library.courses.Actions',
		'NextThought.app.library.content.Actions',
		'NextThought.login.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.CourseActions = NextThought.app.library.courses.Actions.create();
		this.ContentActions = NextThought.app.library.content.Actions.create();

		this.LibraryStore = NextThought.app.library.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		if (window.Service) {
			this.onLogin();
		} else {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var s = window.Service,
			store = this.LibraryStore;


		s.loading = true;

		Promise.all([
			this.CourseActions.loadCourses(s),
			this.ContentActions.loadContent(s)
		]).then(function() {
			s.loading = false;
		});
	}
});
