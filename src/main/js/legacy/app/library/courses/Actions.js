const Ext = require('extjs');
const StoreUtils = require('../../../util/Store');
const {getURL} = require('legacy/util/Globals');

require('../../../common/Actions');
require('./StateStore');
require('../../../model/courses/CourseInstance');
require('../../../model/courses/CourseInstanceAdministrativeRole');
require('../../../model/courseware/CourseInstanceEnrollment');
require('../../../model/courses/LegacyCommunityBasedCourseInstance');
require('../../../util/Store');


module.exports = exports = Ext.define('NextThought.app.library.courses.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();
	},


	/**
	 * Load the admin and enrolled courses, set the link for all courses so it can be loaded when needed
	 * @param  {Service} s the service doc to get the links from
	 * @return {Promise}   fulfills when all the courses have been loaded
	 */
	loadCourses: function (s) {
		var store = this.CourseStore;

		if (!s) {
			console.error('No Service document defined');
			return;
		}

		store.setLoading();

		return Promise.all([
			this.setUpAdministeredCourses((s.getCollection('AdministeredCourses', 'Courses') || {}).href),
			this.setUpAllCourses((s.getCollection('AllCourses', 'Courses') || {}).href),
			this.setUpEnrolledCourses((s.getCollection('EnrolledCourses', 'Courses') || {}).href)
		]);
	},


	/**
	 * Iterate the items and call __precacheEntry on those that have it
	 * @param  {Array} items items to iterate
	 * @return {Promise}	   fulfills when all of the items precaches have finished
	 */
	__precacheItems: function (items) {
		var precache;

		precache = items.map(function (item) {
			if (item.__precacheEntry) {
				return item.__precacheEntry()
					//if its successful fulfill with the course enrollment
					.then(function () { return item;})
					//otherwise fulfill with null so it can be filtered out
					.catch(function () { return null;});
			}

			return Promise.resolve(null);
		});

		return Promise.all(precache)
				.then(function (results) {
					return results.filter(function (r) {
						return !!r;
					});
				});
	},


	setUpAdministeredCourses: function (link) {
		if (!link) {
			this.CourseStore.setAdministeredCourses([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link))
			.then(this.__precacheItems.bind(this))
			.then(this.CourseStore.setAdministeredCourses.bind(this.CourseStore));
	},


	setUpEnrolledCourses: function (link) {
		if (!link) {
			this.CourseStore.setEnrolledCourses([]);

			return Promise.resolve();
		}

		return StoreUtils.loadItems(getURL(link))
			.then(this.__precacheItems.bind(this))
			.then(this.CourseStore.setEnrolledCourses.bind(this.CourseStore));
	},


	setUpAllCourses: function (link) {
		this.CourseStore.setAllCoursesLink(link);
	},


	loadAllCourses: function () {
		var link = this.CourseStore.getAllCoursesLink();

		if (!link) { return Promise.resolve(); }

		return StoreUtils.loadItems(getURL(link))
			.then(this.CourseStore.setAllCourses.bind(this.CourseStore));
	},


	findCourseInstance: function (id) {
		return this.CourseStore.onceLoaded()
			.then(this.CourseStore.findCourseInstance.bind(this.CourseStore, id));
	},


	findCourseByPriority: function (fn) {
		return this.CourseStore.onceLoaded()
			.then(this.CourseStore.findCourseInstanceByPriority.bind(this.CourseStore, fn));
	},


	findForNTIID: function (id) {
		return this.CourseStore.onceLoaded()
			.then(this.CourseStore.findForNTIID.bind(this.CourseStore, id));
	}
});
