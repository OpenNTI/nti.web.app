var Ext = require('extjs');
var ComponentsCurrent = require('../components/Current');
var CoursesStateStore = require('./StateStore');
var ComponentsCollection = require('./components/Collection');


module.exports = exports = Ext.define('NextThought.app.library.courses.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-courses',
	layout: 'none',
	title: 'Courses',
	storeModel: 'NextThought.model.courseware.CourseInstanceEnrollment',

	statics: {
		shouldShow: function () {
			var CourseStore = NextThought.app.library.courses.StateStore.getInstance();

			return CourseStore.onceLoaded()
				.then(function () {
					var enrolledCourses = CourseStore.getCurrentEnrolledCourses() || [],
						hasAvailable = CourseStore.hasAllCoursesLink();

					return enrolledCourses.length || hasAvailable;
				});
		}
	},

	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.CourseStore = NextThought.app.library.courses.StateStore.getInstance();

		this.maybeShowAdd();

		this.CourseStore.onceLoaded()
			.then(this.showCurrentItems.bind(this));

		//update the list every time you enroll or drop a course in a course
		this.mon(this.CourseStore, 'enrolled-courses-set', this.showCurrentItems.bind(this));
	},

	afterRender: function () {
		this.callParent(arguments);

		this.mon(this.el, 'click', this.onClick.bind(this));
	},

	onClick: function (e) {
		if (e.getTarget('.add-more-link')) {
			this.onAddClick();
		}
	},

	maybeShowAdd: function () {
		if (this.CourseStore.hasAllCoursesLink()) {
			this.showAdd();
		} else {
			this.hideAdd();
		}
	},

	showCurrentItems: function () {
		var current = this.CourseStore.getCurrentEnrolledCourses(),
			upcoming = this.CourseStore.getUpcomingEnrolledCourses(),
			archived = this.CourseStore.getArchivedEnrolledCourses(),
			otherCourses = upcoming.concat(archived), otherLength;

		function sort (a, b) {
			var aVal = a.get('CreatedTime'),
				bVal = b.get('CreatedTime');

				//Since we want the most recent enrollments to be at the, sort the lower value
				//to the higher index
			return aVal > bVal ? -1 : aVal === bVal ? 0 : 1;
		}

		current.sort(sort);

		//make sure we have at least 4 if its at all possible
		otherLength = 4 - current.length;

		//if we have < 4 current enrolled courses
		if (otherLength > 0) {

			//get the number of upcoming or archived we need, sorted on when you enrolled
			otherCourses.sort(sort);

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

	showItems: function (current) {
		if (current.length === 0) {
			this.showEmptyText();
			return;
		}

		this.hideEmptyText();

		if (this.store) {
			this.store.loadRecords(current);
		} else {
			this.store = new Ext.data.Store({
				model: this.storeModel,
				data: current
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

	onAddClick: function () {
		if (this.navigateToAllCourses) {
			this.navigateToAllCourses();
		}
	},

	onSeeAllClick: function () {
		if (this.pushRoute) {
			this.pushRoute('Courses', '/courses');
		}
	},

	navigate: function (course, el) {
		if (this.navigateToCourse) {
			this.navigateToCourse(course, el);
		}
	},

	showEmptyText: function () {
		if (this.collection) {
			this.remove(this.collection, true);
			delete this.collection;
		}

		this.emptyText = this.emptyText || this.add({
			xtype: 'box',
			autoEl: {cls: 'empty-text', html: 'You don\'t have any courses yet...<br><a class="add-more-link">+ Add Courses</a>'}
		});
	},

	hideEmptyText: function () {
		if (this.emptyText) {
			this.remove(this.emptyText, true);
			delete this.emptyText;
		}
	}
});
