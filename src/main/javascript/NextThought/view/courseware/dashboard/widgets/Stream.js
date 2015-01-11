Ext.define('NextThought.view.courseware.dashboard.widgets.Stream', {
	extend: 'NextThought.view.courseware.dashboard.widgets.Base',

	requires: [
		'NextThought.view.courseware.dashboard.tiles.Note',
		'NextThought.view.courseware.dashboard.tiles.Topic',
		'NextThought.view.courseware.dashboard.tiles.TopicComment'
	],

	statics: {
		__CLASS_TO_TILE: {
			'Note': 'Note',
			'CommunityHeadlineTopic': 'Topic',
			'GeneralForumComment': 'TopicComment'
		},

		__BASE_WEIGHT: 2,

		getWeight: function(record) {
			var timeWeight = NextThought.view.courseware.dashboard.widgets.Base.getTimeWeight(record.get('Last Modified'));

			return this.__BASE_WEIGHT + timeWeight;
		},


		getTiles: function(course, startDate, endDate) {
			var stream = course.getStream(),
				getWeight = this.getWeight.bind(this),
				classMap = this.__CLASS_TO_TILE;

			function getCmpConfig(record) {
				var cls = classMap[record.get('Class')],
					getConfig = cls && NextThought.view.courseware.dashboard.tiles[cls].getTileConfig(record);

				return getConfig
					.then(function(config) {
						config.record = record;
						config.weight = getWeight(record);
						config.course = course;

						return config;
					});
			}

			return stream.getWeek(startDate, endDate)
				.then(function(items) {
					items = (items || []).map(function(item) {
						return getCmpConfig(item);
					});

					return Promise.all(items);
				})
				.fail(function(reason) {
					console.error('failed to load dashboard stream:', reason);
					return [];
				});
		}
	}
});
