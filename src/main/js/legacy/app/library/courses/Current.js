var Ext = require('extjs');

require('../components/Current');
require('./StateStore');
require('./components/Collection');


module.exports = exports = Ext.define('NextThought.app.library.courses.Current', {
	extend: 'NextThought.app.library.components.Current',
	alias: 'widget.library-current-courses',
	layout: 'none',
	title: 'Courses',
	storeModel: 'NextThought.model.courseware.CourseInstanceEnrollment',

	statics: {
		shouldShow: function () {
			var CourseStore = NextThought.app.library.courses.StateStore.getInstance();

			return CourseStore.onceFavoritesLoaded()
				.then(function () {
					var enrolledCourses = CourseStore.getFavoriteEnrolledCourses() || [],
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

		this.CourseStore.onceFavoritesLoaded()
			.then(this.showCurrentItems.bind(this));

		const mask = () => {
			if (this.el && !this.doNotMaskOnLoad) {
				this.el.mask('Loading...');
			}
		};

		const update = () => this.updateCurrentItems();


		//update the list every time you enroll or drop a course in a course
		this.mon(this.CourseStore, {
			'dropping-course': mask,
			'adding-course': mask,
			'dropped-course': update,
			'added-course': update
		});
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

	updateCurrentItems () {
		this.CourseStore.onceFavoritesLoaded(true)
			.then(() => this.showCurrentItems());
	},

	showCurrentItems: function () {
		const current = this.CourseStore.getFavoriteEnrolledCourses();
		const total = this.CourseStore.getTotalEnrolledCourses();

		if (current.length < total) {
			this.showSeeAll();
		} else {
			this.hideSeeAll();
		}

		if (this.el) {
			this.el.unmask();
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
