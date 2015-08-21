Ext.define('NextThought.app.library.courses.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-courses',

	requires: [
		'NextThought.app.library.courses.StateStore',
		'NextThought.app.library.courses.components.Collection'
	],

	layout: 'none',
	title: 'Courses',
	storeModel: 'NextThought.model.courseware.CourseInstanceEnrollment',

	statics: {
		shouldShow: function() {
			var CourseStore = NextThought.app.library.courses.StateStore.getInstance();

			return CourseStore.onceLoaded()
				.then(function() {
					var enrolledCourses = CourseStore.getCurrentEnrolledCourses() || [],
						hasAvailable = CourseStore.hasAllCoursesLink();

					return enrolledCourses.length || hasAvailable;
				});
		}
	},


	items: [],

	initComponent: function() {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();

		if (this.CourseStore.hasAllCoursesLink()) {
			this.showAdd();
		} else {
			this.hideAdd();
		}

		this.CourseStore.onceLoaded()
			.then(this.showCurrentItems.bind(this));

		//update the list every time you enroll or drop a course in a course
		this.mon(this.CourseStore, 'enrolled-courses-set', this.showCurrentItems.bind(this));
	},


	showCurrentItems: function() {
		var current = this.CourseStore.getCurrentEnrolledCourses(),
			upcoming = this.CourseStore.getUpcomingEnrolledCourses(),
			archived = this.CourseStore.getArchivedEnrolledCourses(),
			otherCourses = upcoming.concat(archived), otherLength;

		//make sure we have at least 4 if its at all possible
		otherLength = 4 - current.length;

		//if we have < 4 current enrolled courses
		if (otherLength > 0) {

			//get the number of upcoming or archived we need, sorted on when you enrolled
			otherCourses.sort(function(a, b) {
				var aVal = a.get('CreatedTime'),
					bVal = a.get('CreatedTime');

				return aVal < bVal ? 1 : aVal === bVal ? 0 : -1;
			});

			current = current.concat(otherCourses.slice(0, otherLength));
		}

		//We are already showing all the current enrollment, so we only need to check
		//if there are more upcoming and archived than we added to get to at least 4
		if ((upcoming.length + archived.length) > otherLength) {
			this.showSeeAll();
		} else {
			this.hideSeeAll();
		}


		return this.showItems(current);
	},


	showItems: function(current) {
		if (this.store) {
			this.store.loadRecords(current);
		} else {
			this.store = new Ext.data.Store({
				model: this.storeModel,
				data: current,
				//Order by when you enrolled
				sorters: [{property: 'CreatedTime', direction: 'ASC'}]
			});
		}


		if (this.collection) {
			this.remove(this.collection, true);
			delete this.collection;
		}

		this.collection = this.add({
			xtype: 'course-collection',
			store: this.store,
			navigate: this.navigate.bind(this)
		});
	},


	onAddClick: function() {
		if (this.pushRoute) {
			this.pushRoute('Available Courses', '/courses/available');
		}
	},


	onSeeAllClick: function() {
		if (this.pushRoute) {
			this.pushRoute('Courses', '/courses');
		}
	},


	navigate: function(course, el) {
		if (this.navigateToCourse) {
			this.navigateToCourse(course, el);
		}
	}
});
