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
		 * @param  {Date} startDate 	the start of the range to get tiles for (inclusive)
		 * @param  {Date} endDate 		the end of the range to get tiles for (inclusive)
		 * @return {Promise}			Promise that will fulfill with an array of tiles to add
		 */
		getTiles: function(course, courseNode, startDate, endDate) {
			return Promise.resolve([]);
		},


		/**
		 * Return a map of name to widget for static widgets that are always present in the dashboard
		 * that have empty, loading, and loaded states.
		 *
		 * @param  {CourseInstance} course     the course instance model
		 * @param  {Node} courseNode the course node from the toc
		 * @param  {Date} date  	 date to get the static tiles for
		 * @return {Object}          widget to show
		 */
		getStaticTiles: function(course, courseNode, date) {
			return false;
		},


		/**
		 * Return a list of config for deadlines
		 *
		 *{
		 *		label: String,
		 *		title: String,
		 *		due: Date,
		 *		navigate: Function
		 *}
		 * @param  {CourseInstance} course     the course instance model
		 * @param  {Node} courseNode the course node from the TOC
		 * @param  {Date} date 		 the date to get the deadlines from
		 * @return {Promise}         fulfills with an array of deadline configs
		 */
		getDeadLines: function(course, courseNode, startDate, endDate) {
			return Promise.resolve([]);
		}
	}
});
