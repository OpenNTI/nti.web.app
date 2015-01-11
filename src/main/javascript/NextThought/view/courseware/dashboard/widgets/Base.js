Ext.define('NextThought.view.courseware.dashboard.widgets.Base', {
	statics: {
		/**
		 * Take the course and returns a list of tiles
		 * that should be put in the dashboard
		 *
		 * NOTE: if there are no tiles fulfill with an empty array, if the promise is rejected the
		 * dashboard tab will be hidden
		 *
		 * @param  {CourseInstance} course     the course instance model
		 * @param  {Node} courseNode	the course node from the TOC
		 * @param  {Date} startDate		the start of the range to get tiles for (inclusive)
		 * @param  {Date} endDate		the end of the range to get tiles for (inclusive)
		 * @param  {Boolean} isNow		if we are getting tiles for the current week
		 * @return {Promise}			Promise that will fulfill with an array of tiles to add
		 */
		getTiles: function(course, startDate, endDate, isNow) {
			return Promise.resolve([]);
		},

		/**
		 * Return a list of tiles that are important upcoming deadlines the user needs to
		 * be aware of
		 *
		 * @param  {CourseInstance} course the course instance model
		 * @param  {Date} date   the date to pick deadlines from
		 * @return {Promise}      Promise that fills with array of tiles to add
		 */
		getUpcomingTiles: function(course, now) {
			return Promise.resolve([]);
		}
	}
});
