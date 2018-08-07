const Ext = require('@nti/extjs');

const {getString} = require('legacy/util/Localization');

const CoursesStateStore = require('../courses/StateStore');

require('../courses/Current');


module.exports = exports = Ext.define('NextThought.app.library.admin.Current', {
	extend: 'NextThought.app.library.courses.Current',
	alias: 'widget.library-current-admin',
	layout: 'none',
	title: getString('NextThought.view.library.View.administeredCourses'),
	storeModel: 'NextThought.model.courses.CourseInstanceAdministrativeRole',

	doNotMaskOnLoad: true,

	statics: {
		shouldShow: function () {
			var CourseStore = CoursesStateStore.getInstance();

			return CourseStore.onceFavoritesLoaded()
				.then(function () {
					var admin = CourseStore.getFavoriteAdminCourses();

					return admin.length;
				});
		}
	},

	items: [],

	showCurrentItems: function () {
		const current = this.CourseStore.getFavoriteAdminCourses();
		const total = this.CourseStore.getTotalAdminCourses();

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

	maybeShowAdd: function () {},

	onSeeAllClick: function () {
		if (this.pushRoute) {
			this.pushRoute(getString('NextThought.view.library.View.administeredCourses'), '/admin');
		}
	}
});
