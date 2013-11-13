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
		'courseware.EnrolledCourses'
	],

	init: function() {
		this.mon(this.application, 'session-ready', 'onSessionReady');
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
		store.load();
	},

	setupEnrolledCourses: function(source) {
		var store = this.__setupStore('courseware.EnrolledCourses', source);
		store.load();
	}
});
