Ext.define('NextThought.app.library.admin.Current', {
	extend: 'NextThought.app.library.courses.Current',
	alias: 'widget.library-current-admin',

	requires: [
		'NextThought.app.library.courses.StateStore'
	],

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

				return aVal < bVal ? 1 : aVal === bVal ? 0 : -1;
			});

			current = current.concat(otherCourses.slice(0, otherLength));
		}


		return this.showItems(current);
	},

	onSeeAllClick: function() {
		if (this.pushRoute) {
			this.pushRoute('Administered Courses', '/admin');
		}
	}
});
