const Ext = require('extjs');
const { encodeForURI } = require('nti-lib-ntiids');

const Globals = require('legacy/util/Globals');

const BundleStateStore = require('./StateStore');

require('legacy/common/Actions');


module.exports = exports = Ext.define('NextThought.app.bundle.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.StateStore = BundleStateStore.getInstance();

		this.callParent(arguments);
	},

	/**
	 * Transition to a bundle, if passed an element from the library show the image expanding
	 * @param  {ContentBundle|ContentPackage} bundle	 the bundle to navigate to
	 * @param  {Element} libraryCard dom node of the image to expand
	 * @return {Promise}			fulfills with the route for the bundle, once the animation is done
	 */
	transitionToBundle: function (bundle, libraryCard) {
		var ntiid = bundle.get('NTIID'),
			route = this.getRootRouteForId(ntiid),
			subRoute = this.StateStore.getRouteFor(ntiid);

		if (subRoute) {
			route = route + '/' + Globals.trimRoute(subRoute);
		}

		return Promise.resolve(route);
	},

	getRootRouteForId: function (id) {
		return '/bundle/' + encodeForURI(id);
	}
});
