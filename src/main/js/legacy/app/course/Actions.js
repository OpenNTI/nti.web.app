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
	 * @param  {string} ntiid	   the course id to navigate to
	 * @param  {Element} libraryCard dom node of the image to expand
	 * @param {string} part the part of the course to route to
	 * @returns {Promise}			fulfills with the route for the course, once the animation is done
	 */
	transitionToCourse: function (ntiid, libraryCard, part) {
		const route = this.getRootRouteForId(ntiid, part);
		// const subRoute = this.StateStore.getRouteFor(ntiid);

		return Promise.resolve(route);
	},

	getRootRouteForId: function (id, part) {
		const partURL = part ? `/${part}` : '';

		return `/course/${encodeForURI(id)}${partURL}`;
	},
});
