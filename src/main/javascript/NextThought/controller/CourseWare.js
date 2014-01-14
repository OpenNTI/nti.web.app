Ext.define('NextThought.controller.CourseWare', {
	extend: 'Ext.app.Controller',

	//<editor-fold desc="Config">
	models: [
		'courseware.AssignmentCollection',
		'courseware.CourseActivity',
		'courseware.CourseCatalogEntry',
		'courseware.CourseCatalogInstructorInfo',
		'courseware.CourseCreditLegacyInfo',
		'courseware.CourseInstance',
		'courseware.CourseInstanceAdministrativeRole',
		'courseware.CourseInstanceEnrollment',
		'courseware.CourseOutline',
		'courseware.Grade',
		'courseware.GradeBook',
		'courseware.GradeBookPart',
		'courseware.GradeBookEntry',
		'courseware.LegacyCommunityBasedCourseInstance',
		'courseware.UsersCourseAssignmentHistory',
		'courseware.UsersCourseAssignmentHistoryItem',
		'courseware.UsersCourseAssignmentHistoryItemFeedback',
		'courseware.UsersCourseAssignmentHistoryItemFeedbackContainer',
		'courseware.navigation.CourseOutlineNode',
		'courseware.navigation.CourseOutlineCalendarNode',
		'courseware.navigation.CourseOutlineContentNode'
	],


	stores: [
		'courseware.AdministeredCourses',
		'courseware.AvailableCourses',
		'courseware.EnrolledCourses'
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
		{ ref: 'courseAssignmentsView', selector: 'content-view-container course-assessment' },
		{ ref: 'libraryView', selector: 'library-view-container' },
		{ ref: 'enrolledCoursesView', selector: 'library-view-container course-collection[kind=enrolled]' },
		{ ref: 'administeredCoursesView', selector: 'library-view-container course-collection[kind=admin]' }
	],
	//</editor-fold>


	init: function() {
		this.TEMP_WORKAROUND_COURSE_TO_CONTENT_MAP = {};
		this.mon(this.application, 'session-ready', 'onSessionReady');


		var control = {
			component: {
				'#main-reader-view reader-content': {
					'beforeNavigate': 'onBeforeContentReaderNavigation'
				},
				'content-view-container': {
					'get-course-hooks': 'applyCourseHooks'
				},
				'*': {
					'course-selected': 'onCourseSelected',
					'navigate-to-assignment': 'onNavigateToAssignment'
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


	//<editor-fold desc="Store Setup">
	applyCourseHooks: function(observable) {
		Ext.apply(observable, {
			getCourseInstance: Ext.bind(this.__getCourseInstance, this),
			isPartOfCourse: Ext.bind(this.__isPartOfCourse, this)
		});
	},


	onSessionReady: function() {
		var s = Service;
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
			if (store.onceLoaded) {
				store.onceLoaded().fulfill(store);
			}
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
	//</editor-fold>


	onBeforeContentReaderNavigation: function(ntiid) {
		var view = this.getCourseAssignmentsView(),
			collection = view.assignmentsCollection,
			currentCourse = view.instance, potentials, store, lin;

		if (!collection) {
			if (currentCourse) {
				console.debug('Blocking navigation until we have assignment information');
				return false; //we can't know yet, deny.
			}
			console.warn('No Course, may be allowing navigation to restructed content if course isn\'t set yet??');
			return true;
		}

		//not in a course, ignore.
		if (!currentCourse) {return true;}

		//the main content reader cannot access assignments. It must go through the assignments tab.
		potentials = collection.pageContainsAssignment(ntiid);
		if (potentials) {
			console.log('Go to the assignment:', potentials);
			//call onNavigateToAssignment()?
			return false;
		}

		store = currentCourse.getNavigationStore();
		lin = ContentUtils.getLineage(ntiid);
		// the last item in the lineage is the root of the content.
		// the next to last entry is the first branch from the root
		// of the content (so its a unit or a lesson... if we can
		// find it in the nav store, its available.)
		return !!store.getById(lin[lin.length - 2]);
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


	onNavigateToAssignment: function(id) {
		var content = this.getContentView(),
			tab = content.tabSpecs.reduce(function(a, i) {
				return a || (i.isAssignment && i);
			}, 0);

		content.onTabClicked(tab);
		content.down('course-assessment-container').gotoAssignment(id);
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
	}
}, function() {

	window.CourseWareUtils = {

		onceLoaded: function() {
			return Promise.pool(
				Ext.getStore('courseware.AvailableCourses').onceLoaded(),
				Ext.getStore('courseware.AdministeredCourses').onceLoaded(),
				Ext.getStore('courseware.EnrolledCourses').onceLoaded()
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
		},


		getEnrollmentStatus: function(contentNtiid) {
			var me = this,
				statusMap = me.statusMap, stores = [];

			function clear() {
				delete me.statusMap;
			}

			if (!statusMap) {
				statusMap = me.statusMap = {};
				this.forEachCourse(function(enrollment) {
					statusMap[enrollment.getCourseCatalogEntry().get('ContentPackageNTIID')] = enrollment.get('Status');
				});

				stores.push(Ext.getStore('courseware.EnrolledCourses'), Ext.getStore('courseware.AdministeredCourses'));

				stores.forEach(function(store) {
					store.on({
						single: true,
						load: clear
					});
				});
			}

			return statusMap[contentNtiid];
		}
	};

});
