Ext.define('NextThought.view.courseware.dashboard.widgets.Lessons', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: ['NextThought.view.courseware.dashboard.tiles.Lesson'],

	statics: {

		__BASE_WEIGHT: 2.5,


		getWeight: function(record) {
			var time = NextThought.view.courseware.dashboard.widgets.Base.getTimeWeight(record.get('AvailableBeginning'));

			return this.__BASE_WEIGHT + time;
		},


		getTiles: function(course, startDate, endDate) {
			var	start = moment(startDate);
			var end = moment(endDate),
				getWeight = this.getWeight.bind(this);

			return course.getNavigationStore().building
				.then(function(store) {
					var lessons = [];

					store.each(function(node) {
						var nodeStart = node.get('startDate');

						if (node.get('type') === 'lesson' && start.isBefore(nodeStart) && end.isAfter(nodeStart)) {
							lessons.push({
								xtype: 'dashboard-lesson',
								record: node,
								weight: getWeight(node)
							});
						}
					});

					return lessons;
				});
		}
	}
});
