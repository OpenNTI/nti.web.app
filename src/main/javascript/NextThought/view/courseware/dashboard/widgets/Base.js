Ext.define('NextThought.view.courseware.dashboard.widgets.Base', {
	statics: {
		/**
		 * Take the course and the course node and returns a list of tiles
		 * that should be put in the dashboard
		 *
		 * NOTE: if there are no tiles fulfill with an empty array, if the promise is rejected the
		 * dashboard tab will be hidden
		 *
		 * @param  {CourseInstance} course     the course instance model
		 * @param  {Node} courseNode	the course node from the TOC
		 * @param  {Date} startDate		the start of the range to get tiles for (inclusive)
		 * @param  {Date} endDate		the end of the range to get tiles for (inclusive)
		 * @return {Promise}			Promise that will fulfill with an array of tiles to add
		 */
		getTiles: function(course, startDate, endDate) {
			return Promise.resolve([]);
		}
	}
});
