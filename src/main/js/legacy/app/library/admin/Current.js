var Ext = require('extjs');
var CoursesCurrent = require('../courses/Current');
var CoursesStateStore = require('../courses/StateStore');


module.exports = exports = Ext.define('NextThought.app.library.admin.Current', {
	extend: 'NextThought.app.library.courses.Current',
	alias: 'widget.library-current-admin',
	layout: 'none',
	title: 'Administered Courses',
	storeModel: 'NextThought.model.courses.CourseInstanceAdministrativeRole',

	doNotMaskOnLoad: true,

	statics: {
		shouldShow: function () {
			var CourseStore = NextThought.app.library.courses.StateStore.getInstance();

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
			this.pushRoute('Administered Courses', '/admin');
		}
	}
});
