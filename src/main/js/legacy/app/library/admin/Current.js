var Ext = require('extjs');
var CoursesCurrent = require('../courses/Current');
var CoursesStateStore = require('../courses/StateStore');


module.exports = exports = Ext.define('NextThought.app.library.admin.Current', {
    extend: 'NextThought.app.library.courses.Current',
    alias: 'widget.library-current-admin',
    layout: 'none',
    title: 'Administered Courses',
    storeModel: 'NextThought.model.courses.CourseInstanceAdministrativeRole',

    statics: {
		shouldShow: function() {
			var CourseStore = NextThought.app.library.courses.StateStore.getInstance();

			return CourseStore.onceLoaded()
				.then(function() {
					var admin = CourseStore.getAdminCourses();

					return admin.length;
				});
		}
	},

    items: [],

    showCurrentItems: function() {
		var current = this.CourseStore.getCurrentAdminCourses(),
			upcoming = this.CourseStore.getUpcomingAdminCourses(),
			archived = this.CourseStore.getArchivedAdminCourses(),
			otherCourses = upcoming.concat(archived), otherLength;

		otherLength = 4 - current.length;

		if (otherLength > 0) {
			otherCourses.sort(function(a, b) {
				var aVal = a.get('CreatedTime'),
					bVal = a.get('CreatedTime');

				return aVal > bVal ? 1 : aVal === bVal ? 0 : -1;
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

    maybeShowAdd: function() {},

    onSeeAllClick: function() {
		if (this.pushRoute) {
			this.pushRoute('Administered Courses', '/admin');
		}
	}
});
