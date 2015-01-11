Ext.define('NextThought.view.courseware.dashboard.widgets.Assignments', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Assignments'],

	statics: {
		getTiles: function(course, courseNode, date) { return Promise.resolve([]); },

		getStaticTiles: function(course, courseNode, date) {
			return {
				assignments: Ext.widget('dashboard-assignments', {
					course: course,
					courseNode: courseNode,
					date: date
				})
			};
		},


		getDeadlines: function(course, courseNode, date) {
			return course.getAssignments()
					.then(function(collection) {
						var comingSoon = [],
							items = collection.get('Items') || [];

							items.forEach(function(item) {
								var due = item.get('availableEnding');

								if (due > date) {
									comingSoon.push(item);
								}
							});
					});
		}
	}
});
