Ext.define('NextThought.app.library.courses.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.model.courses.CourseInstance',
		'NextThought.model.courses.CourseInstanceAdministrativeRole',
		'NextThought.model.courseware.CourseInstanceEnrollment',
		'NextThought.util.Store'
	],


	constructor: function() {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
	},

	/**
	 * Load the admin and enrolled courses, set the link for all courses so it can be loaded when needed
	 * @param  {Service} s the service doc to get the links from
	 * @return {Promise}   fulfills when all the courses have been loaded
	 */
	loadCourses: function(s) {
		var	store = this.CourseStore;

		if (!s) {
			console.error('No Service document defined');
			return; 
		}

		store.setLoading();

		return Promise.all([
			this.setUpAdministeredCourses((s.getCollection('AdministeredCourses', 'Courses') || {}).href),
			this.setUpAllCourses((s.getCollection('AllCourses', 'Courses') || {}).href),
			this.setUpEnrolledCourses((s.getCollection('EnrolledCourses', 'Courses') || {}).href)
		]).always(function() {
			store.setLoaded();
		});
	},


	/**
	 * Iterate the items and call __precacheEntry on those that have it
	 * @param  {Array} items items to iterate
	 * @return {Promise}       fulfills when all of the items precaches have finished
	 */
	__precacheItems: function(items) {
		var precache;

		precache = items.map(function(item) {
			if (item.__precacheEntry) {
				return item.__precacheEntry().fail(function(){});
			}

			return Promise.resolve(null);
		});

		return Promise.all(precache)
				.then(function() {
					return items;
				});
	},


	setUpAdministeredCourses: function(link) {
		if (!link) {
			this.CourseStore.setAdministeredCourses([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link))
			.then(this.__precacheItems.bind(this))
			.then(this.CourseStore.setAdministeredCourses.bind(this.CourseStore));
	},


	setUpEnrolledCourses: function(link) {
		if (!link) {
			this.CourseStore.setEnrolledCourses([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link))
			.then(this.__precacheItems.bind(this))
			.then(this.CourseStore.setEnrolledCourses.bind(this.CourseStore));
	},


	setUpAllCourses: function(link) {
		this.CourseStore.setAllCoursesLink(link);
	},


	loadAllCourses: function() {
		var link = this.CourseStore.getAllCoursesLink();

		if (!link) { return Promise.resolve(); }

		return StoreUtils.loadItems(getURL(link))
			.then(this.CourseStore.setAllCourses.bind(this.CourseStore));
	}
});
