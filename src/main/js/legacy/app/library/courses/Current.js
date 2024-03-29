const Ext = require('@nti/extjs');
const { getString } = require('internal/legacy/util/Localization');

const CoursesStateStore = require('./StateStore');

require('../components/Current');
require('./components/Collection');

module.exports = exports = Ext.define(
	'NextThought.app.library.courses.Current',
	{
		extend: 'NextThought.app.library.components.Current',
		alias: 'widget.library-current-courses',
		layout: 'none',
		title: getString('NextThought.view.library.View.course'),
		storeModel: 'NextThought.model.courseware.CourseInstanceEnrollment',

		statics: {
			shouldShow: function () {
				var CourseStore = CoursesStateStore.getInstance();

				return CourseStore.onceFavoritesLoaded().then(function () {
					var enrolledCourses =
							CourseStore.getFavoriteEnrolledCourses() || [],
						hasCatalog = !!Service.getCollection(
							'Courses',
							'Catalog'
						);

					return enrolledCourses.length || hasCatalog;
				});
			},
		},

		items: [],

		initComponent: function () {
			this.callParent(arguments);

			this.CourseStore = CoursesStateStore.getInstance();

			this.maybeShowAdd();

			this.CourseStore.onceFavoritesLoaded().then(
				this.showCurrentItems.bind(this)
			);

			const mask = () => {
				if (this.el && !this.doNotMaskOnLoad) {
					this.el.mask('Loading...');
				}
			};

			const unmask = () => {
				if (this.el) {
					this.el.unmask();
				}
			};

			const update = (updatedCatalogEntry, el) => {
				this.updateCurrentItems(el);
			};

			//update the list every time you enroll or drop a course in a course
			this.mon(this.CourseStore, {
				'dropping-course': mask,
				'adding-course': mask,
				'dropped-course': update,
				'dropped-error': unmask,
				'added-course': update,
				'modified-course': update,
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
			if (
				Service.getCollection('Courses', 'Catalog') &&
				this.CourseStore.hasAllCoursesLink()
			) {
				this.showAdd();
			} else {
				this.hideAdd();
			}
		},

		updateCurrentItems(maskedEl) {
			// if there's a specified element to mask, mask it, otherwise
			// just mask this component's el
			if (maskedEl && maskedEl.mask) {
				maskedEl.mask('Loading');
			} else {
				this.el.mask && this.el.mask('Loading');
			}

			return this.CourseStore.onceFavoritesLoaded(true).then(() =>
				this.showCurrentItems(maskedEl)
			);
		},

		showCurrentItems: function (maskedEl) {
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

			maskedEl && maskedEl.unmask && maskedEl.unmask();

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
					data: current,
				});
			}

			if (this.collection) {
				this.remove(this.collection, true);
				delete this.collection;
			}

			this.collection = this.add({
				xtype: 'course-collection',
				store: this.store,
				navigate: this.navigate.bind(this),
			});
		},

		onAddClick: function () {
			if (this.navigateToAllCourses) {
				this.navigateToAllCourses();
			}
		},

		onSeeAllClick: function () {
			if (this.pushRoute) {
				this.pushRoute(
					getString('NextThought.view.library.View.course'),
					'/courses'
				);
			}
		},

		navigate: function (course, el, subRoute) {
			if (this.navigateToCourse) {
				this.navigateToCourse(course, el, subRoute);
			}
		},

		showEmptyText: function () {
			if (this.collection) {
				this.remove(this.collection, true);
				delete this.collection;
			}

			this.emptyText =
				this.emptyText ||
				this.add({
					xtype: 'box',
					autoEl: {
						cls: 'empty-text',
						html:
							"You don't have any " +
							getString('NextThought.view.library.View.course') +
							' yet...<br><a class="add-more-link">+ Add ' +
							getString('NextThought.view.library.View.course') +
							'</a>',
					},
				});
		},

		hideEmptyText: function () {
			if (this.emptyText) {
				this.remove(this.emptyText, true);
				delete this.emptyText;
			}
		},
	}
);
