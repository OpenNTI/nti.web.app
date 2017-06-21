const Ext = require('extjs');
const moment = require('moment');

const TilesLesson = require('../tiles/Lesson');

const WidgetsBase = require('./Base');


module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.widgets.Lessons', {
	extend: 'NextThought.app.course.dashboard.components.widgets.Base',

	statics: {

		__BASE_WEIGHT: 2.5,


		getWeight: function (record) {
			var time = WidgetsBase.getTimeWeight(record.get('AvailableBeginning'));

			return this.__BASE_WEIGHT + time;
		},


		getTiles: function (course, startDate, endDate) {
			var start = moment(startDate);
			var end = moment(endDate),
				getWeight = this.getWeight.bind(this);

			function isAfterStart (date) {
				return start.isBefore(date) || start.isSame(date);
			}

			function isBeforeEnd (date) {
				return end.isAfter(date) || end.isSame(date);
			}

			function getCmpConfig (record, innerWeight) {
				var getConfig = TilesLesson.getTileConfig(record);

				return getConfig
						.then(function (config) {
							config.record = record;
							config.weight = getWeight(record) + (innerWeight * 0.01);
							config.course = course;

							return config;
						});
			}

			// Get Outlien Interface
			return course.getOutlineInterface().building
				.then(function (store) {
					var lessons = [];

					store.forEach(function (node, i, total) {
						var nodeStart = node.get('startDate');

						//the node has a start date, is a lesson and starts in the range of the week
						if (nodeStart && node.get('type') === 'lesson' && isAfterStart(nodeStart) && isBeforeEnd(nodeStart)) {
							lessons.push(getCmpConfig(node, (total - i) / total));
						}
					});

					return Promise.all(lessons);
				});
		}
	}
});
