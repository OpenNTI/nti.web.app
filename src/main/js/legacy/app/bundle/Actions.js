const Ext = require('@nti/extjs');
const { encodeForURI } = require('@nti/lib-ntiids');
const {Navigation} = require('@nti/web-content');

const BundleStateStore = require('./StateStore');

require('legacy/common/Actions');

const APP_REGEX = /^\/app/;
const stripApp = route => route.replace(APP_REGEX, '');

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
	 * @returns {Promise}			fulfills with the route for the bundle, once the animation is done
	 */
	transitionToBundle: function (bundle, libraryCard) {
		const rememberedRoute = Navigation.RememberedRoutes.getRememberedRoute([bundle.get ? bundle.get('NTIID') : bundle]);

		return Promise.resolve(stripApp(rememberedRoute || this.getRootRouteForId(bundle)));
	},

	getRootRouteForId: function (id) {
		return '/bundle/' + encodeForURI(id);
	}
});
