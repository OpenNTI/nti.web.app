Ext.define('NextThought.controller.Library', {
	extend: 'Ext.app.Controller',

	models: [
		'courseware.CourseCatalogEntry',
		'courseware.CourseCatalogInstructorInfo',
		'courseware.CourseCreditLegacyInfo',
		'courseware.CourseInstance',
		'courseware.CourseInstanceAdministrativeRole',
		'courseware.CourseInstanceEnrollment'
	],

	refs: [
		{ref: 'libraryView', selector: 'library-view-container'}
	],

	init: function() {
		this.mon(this.application, 'session-ready', 'onSessionReady');
	},


	onSessionReady: function() {
		var me = this;

		CourseWareUtils.onceLoaded()
			.then(function(results) {
				me.coursesLoaded(results[2], results[1], results[0]);
			});

		Library.onceLoaded()
			.then(me.libraryLoaded.bind(me));
	},


	coursesLoaded: function(enrolled, administered, available) {
		var panel = this.getLibraryView().getPanel();

		function split(store, fnName) {
			var current = [],
				archived = [];

			store.each(function(course) {
				var catalog = course.getCourseCatalogEntry(),
					instance = course.get('CourseInstance'),
					isOpen = course.isOpen();

				if (catalog.isExpired()) {
					archived.push(course);
				} else {
					current.push(course);
				}

				//set isOpen on the catalog entry so the available window can know if its open or enrolled
				catalog.set({
					'isOpen': isOpen,
					'isAdmin': course instanceof NextThought.model.courseware.CourseInstanceAdministrativeRole,
					'isChanging': false
				});
			});

			if (panel[fnName]) {
				panel[fnName](current, archived);
			}
		}

		function splitAvailable(store, fnName) {
			var upcoming = [], current = [], archived = [];

			store.each(function(course) {
				var start = course.get('StartDate'),
					end = course.get('EndDate'),
					now = new Date();

				if (start > now) {
					upcoming.push(course);
				} else if (start <= now && end >= now) {
					current.push(course);
				} else {
					archived.push(course);
				}
			});

			if (panel[fnName]) {
				panel[fnName](current, upcoming, archived);
			}
		}

		Library.onceLoaded()
			.then(function() {
				//pass if there are any enrolled or available
				panel.maybeEnableCourses(enrolled.getCount() || available.getCount());

				split(enrolled, 'setEnrolledCourses');
				split(administered, 'setAdministeredCourses');
				splitAvailable(available, 'setAvailableCourses');
			});

		this.mon(enrolled, 'load', function() {
			enrolled.promiseToLoaded.then(split.bind(null, enrolled, 'setEnrolledCourses'));
		});

		this.mon(administered, 'load', function() {
			administered.promisetToLoaded.then(split.bind(null, administered, 'setAdministeredCourses'));
		});

		this.mon(available, 'load', function() {
			available.promiseToLoaded.then(splitAvailable.bind(null, available, 'setAvailableCourses'));
		});
	},


	libraryLoaded: function() {
		this.getLibraryView().getPanel().setBookStore(
				Ext.getStore('library'));
				//Ext.getStore('ContentBundles'));
	}
});
