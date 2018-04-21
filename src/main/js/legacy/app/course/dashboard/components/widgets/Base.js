const Ext = require('@nti/extjs');
const moment = require('moment');

module.exports = exports = Ext.define('NextThought.app.course.dashboard.components.widgets.Base', {
	statics: {

		//the base weight for tiles we return
		__BASE_WEIGHT: 1,

		//how much weight to give the time weight
		__TIME_MODIFIER: 0.1,

		/**
		 * Take the course and returns a list of tiles
		 * that should be put in the dashboard
		 *
		 * NOTE: if there are no tiles fulfill with an empty array, if the promise is rejected the
		 * dashboard tab will be hidden
		 *
		 * @param  {Node} courseNode	the course node from the TOC
		 * @param  {Date} startDate		the start of the range to get tiles for (inclusive)
		 * @param  {Date} endDate		the end of the range to get tiles for (inclusive)
		 * @param  {Boolean} isNow		if we are getting tiles for the current week
		 * @return {Promise}			Promise that will fulfill with an array of tiles to add
		 */
		getTiles: function (courseNode, startDate, endDate, isNow) {
			return Promise.resolve([]);
		},

		/**
		 * Return a list of tiles that are important upcoming deadlines the user needs to
		 * be aware of
		 *
		 * @param  {CourseInstance} course the course instance model
		 * @param  {Date} now the date to pick deadlines from
		 * @return {Promise} Promise that fills with array of tiles to add
		 */
		getUpcomingTiles: function (course, now) {
			return Promise.resolve([]);
		},

		/**
		 * Return the weight of a tile for a record
		 * @param  {Model} record	the record to get the weight for
		 * @return {Number}			weight of the tile
		 */
		getWeight: function (record) {
			return this.__BASE_WEIGHT + record.get('Last Modified');
		},

		/**
		 * Return a number between [0,1] to help put newer items nearer the top
		 * @param  {Date} time the time from the record
		 * @param {Number} scale -
		 * @return {Number} the time modifier to add to the weight
		 */
		getTimeWeight: function (time, scale) {
			if (!time) { return 0; }

			scale = scale || ((x) => x);
			time = moment(time).toDate().getTime();

			var now = (new Date()).getTime();

			return scale(time / now) * this.__TIME_MODIFIER;
		}
	}
});
