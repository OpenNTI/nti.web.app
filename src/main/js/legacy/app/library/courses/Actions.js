const Ext = require('extjs');

const StoreUtils = require('legacy/util/Store');
const {getURL} = require('legacy/util/Globals');
const LoginStateStore = require('legacy/login/StateStore');
const CoursesStateStore = require('legacy/app/library/courses/StateStore');

require('legacy/common/Actions');
require('legacy/model/courses/CourseInstance');
require('legacy/model/courses/CourseInstanceAdministrativeRole');
require('legacy/model/courseware/CourseInstanceEnrollment');
require('legacy/model/courses/LegacyCommunityBasedCourseInstance');
require('legacy/util/Store');
require('./StateStore');


module.exports = exports = Ext.define('NextThought.app.library.courses.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.CourseStore = CoursesStateStore.getInstance();
		this.LoginStore = LoginStateStore.getInstance();

		this.mon(this.CourseStore, {
			'do-load': () => this.loadCourses(),
			'load-favorites': () => this.loadFavorites()
		});

		if (window.Service) {
			this.onLogin();
		} else {
			this.LoginStore.registerLoginAction(this.onLogin.bind(this), 'load-all-courses-link');
		}
	},


	onLogin () {
		this.LoginStore.getService()
			.then((service) => {
				return this.setUpAllCourses((service.getCollection('AllCourses', 'Courses') || {}).href);
			});
	},


	/**
	 * Load the admin and enrolled courses, set the link for all courses so it can be loaded when needed
	 * @param  {Service} s the service doc to get the links from
	 * @return {Promise}   fulfills when all the courses have been loaded
	 */
	loadCourses: function () {
		var store = this.CourseStore;

		if (store.isLoading()) {
			return;
		}

		store.setLoading();

		return this.LoginStore.getService()
			.then((service) => {

				if (!service) {
					console.error('No Service document defined');
					return;
				}

				return Promise.all([
					this.setUpAdministeredCourses(),
					this.setUpAllCourses((service.getCollection('AllCourses', 'Courses') || {}).href),
					this.setUpEnrolledCourses()
				]);
			})
			.then(() => store.setLoaded());
	},

	loadAdminUpcomingCourses () {
		return this.__loadCoursesOfType('AdministeredCourses', 'Upcoming');
	},

	loadAdminCurrentCourses () {
		return this.__loadCoursesOfType('AdministeredCourses', 'Current');
	},

	loadAdminArchivedCourses () {
		return this.__loadCoursesOfType('AdministeredCourses', 'Archived');
	},

	loadEnrolledUpcomingCourses () {
		return this.__loadCoursesOfType('EnrolledCourses', 'Upcoming');
	},

	loadEnrolledCurrentCourses () {
		return this.__loadCoursesOfType('EnrolledCourses', 'Current');
	},

	loadEnrolledArchivedCourses () {
		return this.__loadCoursesOfType('EnrolledCourses', 'Archived');
	},

	loadAllUpcomingCourses () {
		return this.__loadCoursesOfType('AllCourses', 'Upcoming').then((items) => {
			this.CourseStore.setAllCourses(items);

			return items;
		});
	},

	loadAllCurrentCourses () {
		return this.__loadCoursesOfType('AllCourses', 'Current').then((items) => {
			this.CourseStore.setAllCourses(items);

			return items;
		});
	},

	loadAllArchivedCourses () {
		return this.__loadCoursesOfType('AllCourses', 'Archived').then((items) => {
			this.CourseStore.setAllCourses(items);

			return items;
		});
	},

	__loadCoursesOfType (courseLevel, courseType) {
		var store = this.CourseStore;

		if (store.isTypeLoading(courseLevel, courseType)) {
			return;
		}

		store.setTypeLoading(courseLevel, courseType);

		return this.LoginStore.getService()
			.then((service) => {
				if (!service) {
					console.error('No Service document defined');
					return;
				}

				const courseCollection = service.getCollection(courseLevel, 'Courses');

				return this.__setupCourseByType(service.getLinkFrom(courseCollection.Links, courseType), courseLevel, courseType);
			})
			.then(() => {
				store.setTypeLoaded(courseLevel, courseType);
			});
	},

	__setupCourseByType (link, courseLevel, courseType) {
		if (!link) {
			this.CourseStore.setCoursesByType(courseLevel, courseType, []);

			return Promise.resolve();
		}

		return StoreUtils.loadBatch(getURL(link))
			.then(batch => {
				return batch.Items;
			})
			.then(items => {
				return courseLevel === 'AdministeredCourses' || courseLevel === 'EnrolledCourses'
					? this.__precacheItems(items)
					: items;
			})
			.then(items => this.CourseStore.setCoursesByType(courseLevel, courseType, items));
	},

	loadFavorites () {
		var store = this.CourseStore;

		if (store.isFavoritesLoading()) {
			return;
		}

		store.setFavoritesLoading();

		return this.LoginStore.getService()
			.then((service) => {
				if (!service) {
					console.error('No Service document defined');
					return;
				}

				const adminCollection = service.getCollection('AdministeredCourses', 'Courses');
				const enrolledCollection = service.getCollection('EnrolledCourses', 'Courses');

				const getFavoritesLink = (collection) => collection && service.getLinkFrom(collection.Links, 'Favorites');

				return Promise.all([
					this.setUpFavoriteAdminCourses(getFavoritesLink(adminCollection)),
					this.setUpFavoriteEnrolledCourses(getFavoritesLink(enrolledCollection))
				]);
			})
			.then(() => {
				store.setFavoritesLoaded();
			});
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


	setUpFavoriteAdminCourses (link) {
		if (!link) {
			this.CourseStore.setFavoriteAdminCourses([]);

			return Promise.resolve();
		}

		return StoreUtils.loadBatch(getURL(link))
			.then(batch => {
				this.CourseStore.setTotalAdminCount(batch.Total);

				return batch.Items;
			})
			.then(items => this.__precacheItems(items))
			.then(items => this.CourseStore.setFavoriteAdminCourses(items));
	},


	setUpFavoriteEnrolledCourses (link) {
		if (!link) {
			this.CourseStore.setFavoriteEnrolledCourses([]);

			return Promise.resolve();
		}

		return StoreUtils.loadBatch(getURL(link))
			.then(batch => {
				this.CourseStore.setTotalEnrolledCount(batch.Total);

				return batch.Items;
			})
			.then(items => this.__precacheItems(items))
			.then(items => this.CourseStore.setFavoriteEnrolledCourses(items));
	},


	setUpAdministeredCourses: function () {
		return Promise.all([
			this.loadAdminUpcomingCourses(),
			this.loadAdminCurrentCourses(),
			this.loadAdminArchivedCourses()
		]);
	},

	loadItems: function (collectionName, subName, type) {
		return this.LoginStore.getService()
			.then((service) => {
				if (!service) {
					console.error('No Service document defined');
					return;
				}

				const courseCollection = service.getCollection(collectionName, subName);

				return StoreUtils.loadItems(getURL(service.getLinkFrom(courseCollection.Links, type)));
			});
	},

	loadItemsAndPrecache: function (collectionName, subName, type) {
		return this.loadItems(collectionName, subName, type)
			.then(this.__precacheItems.bind(this));
	},

	setUpEnrolledCourses: function () {
		return Promise.all([
			this.loadEnrolledUpcomingCourses(),
			this.loadEnrolledCurrentCourses(),
			this.loadEnrolledArchivedCourses()
		]);
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
