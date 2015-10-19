Ext.define('NextThought.app.bundle.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.util.Parsing',
		'NextThought.app.bundle.StateStore'
	],


	constructor: function() {
		this.StateStore = NextThought.app.bundle.StateStore.getInstance();

		this.callParent(arguments);
	},


	/**
	 * Transition to a bundle, if passed an element from the library show the image expanding
	 * @param  {ContentBundle|ContentPackage} bundle     the bundle to navigate to
	 * @param  {Element} libraryCars dom node of the image to expand
	 * @return {Promise}            fulfills with the route for the bundle, once the animation is done
	 */
	transitionToBundle: function(bundle, libraryCard) {
		var ntiid = bundle.get('NTIID'),
			route = '/bundle/' + ParseUtils.encodeForURI(ntiid),
			subRoute = this.StateStore.getRouteFor(ntiid);

		if (subRoute) {
			route = route + '/' + Globals.trimRoute(subRoute);
		}

		return Promise.resolve(route);
	}
});
