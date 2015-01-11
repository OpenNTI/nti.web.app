Ext.define('NextThought.view.courseware.dashboard.widgets.Base', {
	statics: {
		/**
		 * Take the course and the course node and returns a list of tiles
		 * that should be put in the dashboard
		 *
		 * NOTE: if there are no tiles fulfill with an empty array, if the promise is rejected the
		 * dashboard tab will be hidden
		 *
		 * @param  {NextThought.model.courseware.CourseInstance} course     the course instance model
		 * @param  {Node} courseNode	the course node from the TOC
		 * @param {Date} date the date to build the dashboard for
		 * @return {Promise}	Promise that will fulfill with an array of tiles to add
		 */
		getTiles: function(course, courseNode, date) {
			return Promise.resolve([]);
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
		 * @param  {NextThought.model.courseware.CourseInstance} course     the course instance model
		 * @param  {Node} courseNode the course node from the TOC
		 * @param  {Date} date       the date to build the dashboard for
		 * @return {Promise}         fulfills with an array of deadline configs
		 */
		getDeadLines: function(course, courseNode, date) {
			return Promise.resolve([]);
		}
	}
});
