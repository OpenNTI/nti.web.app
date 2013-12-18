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
				'course-assessment-activity': { 'itemclick': 'navigateToAssignment' },
				'course-assessment-assignment-list': { 'itemclick': 'navigateToAssignment' },
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


	onAdministeredCoursesLoaded: function(store) {
		var cmp = this.getAdministeredCoursesView();
		cmp[store.getCount() ? 'show' : 'hide']();
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


	onEnrolledCoursesLoaded: function(store) {
		var cmp = this.getEnrolledCoursesView();
		cmp[store.getCount() ? 'show' : 'hide']();
	},


	onCourseSelected: function(instance, callback) {

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
		var s = Ext.getStore('courseware.EnrolledCourses'),
			m = this.__getCourseMapping(thing),
			p = new Promise();


		s.findCourseBy(function(c) {
			var i = c.get('CourseInstance'),
				links = i && i.get('Links'),
				href = links && links.getRelHref('CourseCatalogEntry');
			return href === m;
		}).then(
				function(enrollemnt) {
					p.fulfill(enrollemnt.get('CourseInstance'));
				},
				function(reason) {
					p.reject(reason);
				});

		return p;
	},


	navigateToAssignment: function(view, record) {
		this.fireEvent('show-ntiid', record.get('containerId'));
	}
});
