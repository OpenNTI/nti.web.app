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

		this.mon(this.CourseStore, 'enrolled-courses-set', this.showCurrentItems.bind(this));
	},


	showCurrentItems: function() {
		var current = this.CourseStore.getCurrentEnrolledCourses(),
			upcoming = this.CourseStore.getUpcomingEnrolledCourses(),
			archived = this.CourseStore.getArchivedEnrolledCourses(),
			otherCourses = upcoming.concat(archived), otherLength;

		otherLength = 4 - current.length;

		if (otherLength > 0) {
			otherCourses.sort(function(a, b) {
				var aVal = a.get('CreatedTime'),
					bVal = a.get('CreatedTime');

				return aVal < bVal ? 1 : aVal === bVal ? 0 : -1;
			});

			current = current.concat(otherCourses.slice(0, otherLength));
		}

		if ((upcoming.length + archived.length) > otherLength) {
			this.showSeeAll();
		} else {
			this.hideSeeAll();
		}


		return this.showItems(current);
	},


	showItems: function(current) {
		var store = new Ext.data.Store({
				model: this.storeModel,
				data: current,
				sorters: [{property: 'CreatedTime', direction: 'ASC'}]
			});

		if (this.collection) {
			this.remove(this.collection);
		}

		this.collection = this.add({
			xtype: 'course-collection',
			store: store
		});
	}
});
