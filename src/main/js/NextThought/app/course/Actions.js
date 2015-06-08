Ext.define('NextThought.app.course.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.util.Parsing',
		'NextThought.app.course.StateStore'
	],

	constructor: function() {
		this.callParent(arguments);

		this.StateStore = NextThought.app.course.StateStore.getInstance();
	},

	/**
	 * Transition to a course, if passed a img element from the library show the image expanding
	 * @param  {CourseInstance} course     the course to navigate to
	 * @param  {Element} libraryCars dom node of the image to expand
	 * @return {Promise}            fulfills with the route for the course, once the animation is done
	 */
	transitionToCourse: function(course, libraryCard) {
		var ntiid = course.getId();

		ntiid = ParseUtils.encodeForURI(ntiid);

		return Promise.resolve('/course/' + ntiid);
	}
});
