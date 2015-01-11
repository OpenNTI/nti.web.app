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

			function isAfterStart(date) {
				return start.isBefore(date) || start.isSame(date);
			}

			function isBeforeEnd(date) {
				return end.isAfter(date) || end.isSame(date);
			}

			function getCmpConfig(record) {
				var getConfig = NextThought.view.courseware.dashboard.tiles.Lesson.getTileConfig(record);

				return getConfig
						.then(function(config) {
							config.record = record;
							config.weight = getWeight(record);
							config.course = course;

							return config;
						});
			}

			return course.getNavigationStore().building
				.then(function(store) {
					var lessons = [];

					store.each(function(node) {
						var nodeStart = node.get('startDate');

						if (node.get('type') === 'lesson' && isAfterStart(nodeStart) && isBeforeEnd(nodeStart)) {
							lessons.push(getCmpConfig(node));
						}
					});

					return Promise.all(lessons);
				});
		}
	}
});
