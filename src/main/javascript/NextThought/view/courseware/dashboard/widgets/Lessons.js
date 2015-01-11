Ext.define('NextThought.view.courseware.dashboard.widgets.Lessons', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Lessons'],

	statics: {
		getTiles: function(course, courseNode, date) {
			var lastChecked = new Date();

			lastChecked.setDate(lastChecked.getDate() - 3);//set last checked to 3 days ago to for now

			return course.getNavigationStore().building
						.then(function(store) {
							var lessons = [];

							store.each(function(node) {
								var start = node.get('AvailableBeginning');

								if (node.get('type') === 'lesson' && start > lastChecked) {
									lessons.push(node);
								}
							});

							//return [Ext.widget('dashboard-lessons', {
							//	lessons: lessons
							//})];
						});
		}
	}
});
