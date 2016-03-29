var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var CommonActions = require('../../common/Actions');
var UtilParsing = require('../../util/Parsing');
var CourseStateStore = require('./StateStore');


module.exports = exports = Ext.define('NextThought.app.course.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.StateStore = NextThought.app.course.StateStore.getInstance();
	},

	/**
	 * Transition to a course, if passed an element from the library show the image expanding
	 * @param  {CourseInstance} course	   the course to navigate to
	 * @param  {Element} libraryCars dom node of the image to expand
	 * @return {Promise}			fulfills with the route for the course, once the animation is done
	 */
	transitionToCourse: function (course, libraryCard) {
		var ntiid = course.getId(),
			route = this.getRootRouteForId(ntiid),
			subRoute = this.StateStore.getRouteFor(ntiid);

		return Promise.resolve(route);
	},

	getRootRouteForId: function (id) {
		return '/course/' + ParseUtils.encodeForURI(id);
	}
});
