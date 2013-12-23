Ext.define('NextThought.controller.CourseWare', {
	extend: 'Ext.app.Controller',

	models: [
		'courseware.CourseCatalogEntry',
		'courseware.CourseCatalogInstructorInfo',
		'courseware.CourseCreditLegacyInfo',
		'courseware.CourseInstance',
		'courseware.CourseInstanceAdministrativeRole',
		'courseware.CourseInstanceEnrollment',
		'courseware.CourseOutline',
		'courseware.Grade',
		'courseware.GradeBook',
		'courseware.LegacyCommunityBasedCourseInstance',
		'courseware.UsersCourseAssignmentHistory',
		'courseware.UsersCourseAssignmentHistoryItem',
		'courseware.UsersCourseAssignmentHistoryItemFeedback',
		'courseware.UsersCourseAssignmentHistoryItemFeedbackContainer',
		'courseware.navigation.CourseOutlineNode',
		'courseware.navigation.CourseOutlineContentNode'
	],


	stores: [
		'courseware.AdministeredCourses',
		'courseware.AvailableCourses',
		'courseware.EnrolledCourses',
		'courseware.Navigation'
	],


	views: [
		'courseware.assessment.assignments.FilterBar',
		'courseware.assessment.assignments.Grouping',
		'courseware.assessment.assignments.List',
		'courseware.assessment.assignments.View',
		'courseware.assessment.Activity',
		'courseware.assessment.Navigation',
		'courseware.assessment.Performance'
	],


	refs: [
		{ ref: 'mainNav', selector: 'main-navigation'},
		{ ref: 'contentView', selector: 'content-view-container' },
		{ ref: 'libraryView', selector: 'library-view-container' },
		{ ref: 'enrolledCoursesView', selector: 'library-view-container course-collection[kind=enrolled]' },
		{ ref: 'administeredCoursesView', selector: 'library-view-container course-collection[kind=admin]' }
	],


	init: function() {
		this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP = {};
		this.mon(this.application, 'session-ready', 'onSessionReady');


		var control = {
			component: {
				'content-view-container': {
					'get-course-hooks': 'applyCourseHooks'
				},
				'course-assessment-activity[view=student]': { 'itemclick': 'navigateToAssignment' },
				'course-assessment-assignment-list[view=sudent]': { 'itemclick': 'navigateToAssignment' },
				'course-assessment-assignment-group grid': { 'itemclick': 'navigateToAssignment' },


				'*': {
					'course-selected': 'onCourseSelected'
				}
			},
			controller: {
				'*': {
					'course-selected': 'onCourseSelected'
				}
			}
		};

		this.listen(control, this);
	},


	applyCourseHooks: function(observable) {
		Ext.apply(observable, {
			getCourseInstance: Ext.bind(this.__getCourseInstance, this),
			isPartOfCourse: Ext.bind(this.__isPartOfCourse, this)
		});
	},


	onSessionReady: function() {
		var s = $AppConfig.service;
		this.setupAdministeredCourses((s.getCollection('AdministeredCourses', 'Courses') || {}).href);
		this.setupAvailableCourses((s.getCollection('AllCourses', 'Courses') || {}).href);
		this.setupEnrolledCourses((s.getCollection('EnrolledCourses', 'Courses') || {}).href);

		this.filterAdministeredEnrolledCourses();
	},


	filterAdministeredEnrolledCourses: function() {
		var admin = Ext.getStore('courseware.AdministeredCourses'),
			enrolled = Ext.getStore('courseware.EnrolledCourses');

		function notAdministrated(o) {
			var id = o.get('CourseInstance').getId(), found = false;
			admin.each(function(a) {
				found = id === a.get('CourseInstance').getId();
				return !found;
			});

			return !found;
		}

		function refilter() {
			enrolled.filter();
		}

		enrolled.removeFilter('adminFilter');
		enrolled.addFilter({ id: 'adminFilter', filterFn: notAdministrated });

		admin.on('load', refilter);
		enrolled.on('load', refilter);
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


	setupAdministeredCourses: function(source) {
		var store = this.__setupStore('courseware.AdministeredCourses', source);
		if (!store) {
			return;
		}
		this.mon(store, 'load', 'onAdministeredCoursesLoaded');
		store.load();
	},


	setupAvailableCourses: function(source) {
		var store = this.__setupStore('courseware.AvailableCourses', source);
		if (!store) {
			return;
		}
		this.mon(store, {
			beforeload: 'onAvailableCoursesLoading',
			load: 'onAvailableCoursesLoaded'
		});
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
		this.onCoursesLoaded(this.getEnrolledCoursesView(), store);
	},


	onAdministeredCoursesLoaded: function(store) {
		this.onCoursesLoaded(this.getAdministeredCoursesView(), store);
	},


	onAvailableCoursesLoading: function() {
		this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP = {};
	},


	onAvailableCoursesLoaded: function(store) {
		var me = this,
			contentMap = me.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP;
		store.each(function(o) {
			var k = o.get('ContentPackageNTIID');
			if (!contentMap.hasOwnProperty(k)) {
				contentMap[k] = o.get('href');
			} else {
				console.error('Assertion Failed! There is another mapping to content package: ' + k);
			}
		});
	},


	onCoursesLoaded: function(cmp, store) {
		Library.onceLoaded().then(function() {
			var content = Library.getCount() && store.getCount();
			cmp[content ? 'show' : 'hide']();
			if (!content) {
				console.debug('Hiding ' + cmp.id + ' because the library or the store (' + store.storeId + ') was empty');
			}
		});
	},


	onCourseSelected: function(instance, callback) {
		var c;

		if (!instance.__getLocationInfo()) {
			c = instance.getCourseCatalogEntry();
			console.error('The Content Package for this course has not been loaded. Check that this user is "enrolled".\n' +
						  '\tInstance ID: ' + instance.getId() + '\n' +
						  '\tCourseCatalogEntry ID: ' + (c && c.getId()) + '\n' +
						  '\tContent Package ID:' + (c && c.get('ContentPackageNTIID')));
			return false;
		}

		if (this.fireEvent('show-view', 'content', true) === false) {
			return false;
		}

		history.beginTransaction('navigation-transaction');

		try {
			this.getMainNav().updateCurrent(false, instance);
			this.getContentView().onCourseSelected(instance);
			Ext.callback(callback);
			return true;
		} finally {
			history.endTransaction('navigation-transaction');
		}
	},


	__isPartOfCourse: function(thing) {
		return Boolean(this.__getCourseMapping(thing));
	},


	/**
	 *
	 * @param {String|NextThought.model.PageInfo} thing A Content NTIID or pageInfo
	 * @private
	 */
	__getCourseMapping: function(thing) {
		var ifo = ContentUtils.getLocation(thing),
			title = ifo && ifo.title,
			ntiid = title && title.get && title.get('NTIID');
		return this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP[ntiid];
	},


	__getCourseInstance: function(thing) {
		var m = this.__getCourseMapping(thing),
			p = new Promise();


		CourseWareUtils.findCourseBy(function(c) {
			var i = c.get('CourseInstance'),
				links = i && i.get('Links'),
				href = links && links.getRelHref('CourseCatalogEntry');
			return href === m;
		}).then(
				function(o) {
					p.fulfill(o.get('CourseInstance'));
				},
				function(reason) {
					p.reject(reason);
				});

		return p;
	},


	navigateToAssignment: function(view, record) {
		this.fireEvent('show-ntiid', record.get('containerId'));
	}
}, function() {

	window.CourseWareUtils = {

		onceLoaded: function() {
			return Promise.pool(
				Ext.getStore('courseware.EnrolledCourses').onceLoaded(),
				Ext.getStore('courseware.AdministeredCourses').onceLoaded()
			);
		},


		findCourseBy: function() {
			var promise = new Promise(),
				enrolled = Ext.getStore('courseware.EnrolledCourses'),
				admin = Ext.getStore('courseware.AdministeredCourses'),
				args = Ext.Array.clone(arguments);

			// I would pool, but its most likely to come from enrolled, and if one promise fails in a pool,
			// the entire pool fails, so it would read poorly in the code only operating on the "failed" case. :}
			enrolled.findCourseBy.apply(enrolled, args)
					.done(function(rec) { promise.fulfill(rec); })
					.fail(function() { admin.findCourseBy.apply(admin, args).then(promise); });

			return promise;
		},


		resolveCourse: function(courseInstanceId) {
			var promise = new Promise(),
				enrolled = Ext.getStore('courseware.EnrolledCourses'),
				admin = Ext.getStore('courseware.AdministeredCourses');

			if (courseInstanceId) {
				enrolled.getCourseInstance(courseInstanceId)
						.done(function(rec) {
							promise.fulfill(rec);
						})
						.fail(function() {
							admin.getCourseInstance(courseInstanceId).then(promise);
						});

			} else {
				promise.fulfill(undefined);
			}

			return promise;
		},


		resolveCourseInstanceContainer: function(courseInstanceId) {
			function f(r) {
				var i = r && r.get('CourseInstance');
				return i && i.getId() === courseInstanceId;
			}
			return this.findCourseBy(f);
		},


		forEachCourse: function(fn) {
			var//promise = new Promise(), //todo: make this promise based
				enrolled = Ext.getStore('courseware.EnrolledCourses'),
				admin = Ext.getStore('courseware.AdministeredCourses');

			// the store's each function does not return anything. :| lame.
			// I cannot know if the iteration was terminated so that i can skip calling the next.
			// So I overwrote the implementation to return a value. :}
			if (enrolled.each(fn) === false) {
				admin.each(fn);
			}
		}
	};

});
