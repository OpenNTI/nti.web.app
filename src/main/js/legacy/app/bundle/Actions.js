var Ext = require('extjs');
var Globals = require('../../util/Globals');
var ParseUtils = require('../../util/Parsing');
var CommonActions = require('../../common/Actions');
var UtilParsing = require('../../util/Parsing');
var BundleStateStore = require('./StateStore');


module.exports = exports = Ext.define('NextThought.app.bundle.Actions', {
	extend: 'NextThought.common.Actions',

	constructor: function () {
		this.StateStore = NextThought.app.bundle.StateStore.getInstance();

		this.callParent(arguments);
	},

	/**
	 * Transition to a bundle, if passed an element from the library show the image expanding
	 * @param  {ContentBundle|ContentPackage} bundle	 the bundle to navigate to
	 * @param  {Element} libraryCars dom node of the image to expand
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
		return '/bundle/' + ParseUtils.encodeForURI(id);
	}
});
