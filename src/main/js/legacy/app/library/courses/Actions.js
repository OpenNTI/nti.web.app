const Ext = require('extjs');
const StoreUtils = require('../../../util/Store');
const {getURL} = require('legacy/util/Globals');

require('../../../common/Actions');
require('legacy/login/StateStore');
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
		this.LoginStore = NextThought.login.StateStore.getInstance();

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
					this.setUpAdministeredCourses((service.getCollection('AdministeredCourses', 'Courses') || {}).href),
					this.setUpAllCourses((service.getCollection('AllCourses', 'Courses') || {}).href),
					this.setUpEnrolledCourses((service.getCollection('EnrolledCourses', 'Courses') || {}).href)
				]);
			})
			.then(() => store.setLoaded())
			.then(() => store.afterAddCourse());
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
			.then(items => this.CourseStore.setFavoriteAdminCourses(items))
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
			.then(items => this.CourseStore.setFavoriteEnrolledCourses(items))
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
