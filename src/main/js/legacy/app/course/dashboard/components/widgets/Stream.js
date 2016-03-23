var Ext = require('extjs');
var WidgetsBase = require('./Base');
var TilesNote = require('../tiles/Note');
var TilesTopic = require('../tiles/Topic');
var TilesTopicComment = require('../tiles/TopicComment');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.widgets.Stream', {
	extend: 'NextThought.app.course.dashboard.components.widgets.Base',

	statics: {
		__CLASS_TO_TILE: {
			'Note': 'Note',
			'CommunityHeadlineTopic': 'Topic'
			//'GeneralForumComment': 'TopicComment'
		},

		__BASE_WEIGHT: 2,

		getWeight: function(record) {
			var timeWeight = NextThought.app.course.dashboard.components.widgets.Base.getTimeWeight(record.get('Last Modified'));

			return this.__BASE_WEIGHT + timeWeight;
		},


		getTiles: function(course, startDate, endDate) {
			var stream = course.getStream(),
				getWeight = this.getWeight.bind(this),
				classMap = this.__CLASS_TO_TILE;

			function getCmpConfig(record) {
				var cls = classMap[record.get('Class')],
					getConfig = cls && NextThought.app.course.dashboard.components.tiles[cls].getTileConfig(record, course);

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
					var tiles = [];

					(items || []).forEach(function(item) {
						if (classMap[item.get('Class')]) {
							tiles.push(getCmpConfig(item));
						}
					});

					return Promise.all(tiles);
				})
				.fail(function(reason) {
					console.error('failed to load dashboard stream:', reason);
					return [];
				});
		}
	}
});
