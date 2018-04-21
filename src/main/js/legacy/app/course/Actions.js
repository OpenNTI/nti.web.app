const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');

const CourseStateStore = require('./StateStore');

require('legacy/common/Actions');

module.exports = exports = Ext.define('NextThought.app.course.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.callParent(arguments);

		this.StateStore = CourseStateStore.getInstance();
	},

	/**
	 * Transition to a course, if passed an element from the library show the image expanding
	 * @param  {String} ntiid	   the course id to navigate to
	 * @param  {Element} libraryCard dom node of the image to expand
	 * @return {Promise}			fulfills with the route for the course, once the animation is done
	 */
	transitionToCourse: function (ntiid, libraryCard) {
		const route = this.getRootRouteForId(ntiid);
		// const subRoute = this.StateStore.getRouteFor(ntiid);

		return Promise.resolve(route);
	},

	getRootRouteForId: function (id) {
		return '/course/' + encodeForURI(id);
	}
});
