Ext.define('NextThought.view.courseware.dashboard.widgets.Lessons', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Lesson'],

	statics: {
		getTiles: function(course, courseNode, startDate, endDate) {
			var	start = moment(startDate);
			var end = moment(endDate);

			return course.getNavigationStore().building
				.then(function(store) {
					var lessons = [];

					store.each(function(node) {
						var nodeStart = node.get('startDate');

						if (node.get('type') === 'lesson' && start.isBefore(nodeStart) && end.isAfter(nodeStart)) {
							lessons.push({
								xtype: 'dashboard-lesson',
								lesson: node,
								weight: 2
							});
						}
					});

					return lessons;
				});
		}
	}
});
