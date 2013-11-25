Ext.define('NextThought.controller.CourseWare', {
	extend: 'Ext.app.Controller',

	models: [
		'courseware.CourseCatalogEntry',
		'courseware.CourseCatalogInstructorInfo',
		'courseware.CourseCreditLegacyInfo',
		'courseware.CourseInstance',
		'courseware.CourseInstanceEnrollment'
	],

	stores: [
		'courseware.AvailableCourses',
		'courseware.EnrolledCourses',
		'courseware.Navigation'
	],


	refs: [
		{ ref: 'mainNav', selector: 'main-navigation'},
		{ ref: 'contentView', selector: 'content-view-container' },
		{ ref: 'libraryView', selector: 'library-view-container' },
		{ ref: 'enrolledCoursesView', selector: 'library-view-container course-collection' }
	],


	init: function() {
		this.mon(this.application, 'session-ready', 'onSessionReady');

		var control = {
			component: {
				'*': {
					 'course-selected': 'onCourseSelected'
				}
			}
		};

		this.listen(control, this);
	},


	onSessionReady: function() {
		var s = $AppConfig.service;
		this.setupAvailableCourses((s.getCollection('AllCourses', 'Courses') || {}).href);
		this.setupEnrolledCourses((s.getCollection('EnrolledCourses', 'Courses') || {}).href);
	},


	__setupStore: function(storeId, source) {
		var store = Ext.getStore(storeId);
		if (Ext.isEmpty(source)) {
			console.warn('CourseWare: Not setting up store: ' + storeId + ', no source given');
			return null;
		}
		store.proxy.url = getURL(source);
		return store;
	},


	setupAvailableCourses: function(source) {
		var store = this.__setupStore('courseware.AvailableCourses', source);
		if (!store) {
			return;
		}
		store.load();
	},


	setupEnrolledCourses: function(source) {
		var store = this.__setupStore('courseware.EnrolledCourses', source);
		if (!store) {
			return;
		}
		this.mon(store, 'load', 'onEnrolledCoursesLoaded');
		store.load();
	},


	onEnrolledCoursesLoaded: function(store) {
		var cmp = this.getEnrolledCoursesView();
		cmp[store.getCount() ? 'show' : 'hide']();
	},


	onCourseSelected: function(instance, catalogEntry) {

		if (this.fireEvent('show-view', 'content', true) === false) {
			return false;
		}

		history.beginTransaction('navigation-transaction');

		try {
			this.getMainNav().updateCurrent(false, catalogEntry);
			this.getContentView().onCourseSelected(instance, catalogEntry);
			return true;
		} finally {
			history.endTransaction('navigation-transaction');
		}
	}
});
