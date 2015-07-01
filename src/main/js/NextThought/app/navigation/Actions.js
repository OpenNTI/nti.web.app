Ext.define('NextThought.app.navigation.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.app.navigation.StateStore',
		'NextThought.util.Content'
	],


	statics: {
		pushRootRoute: function(title, route, precache) {
			if (this.doPushRootRoute) {
				this.doPushRootRoute(title, route, precache);
			}
		},

		replaceRootRoute: function(title, route, precache) {
			if (this.doReplaceRootRoute) {
				this.doReplaceRootRoute(title, route, precache);
			}
		},

		navigateToHref: function(href) {
			var parts = href.split('#'),
					newBase = parts[0],
					newFragment = parts[1],
					currentLocation = window.location.href,
					currentParts = currentLocation.split('#'),
					currentBase = currentParts[0],
					currentFragment = currentParts[1];

			//Are we an nttid?
			if (ParseUtils.isNTIID(newBase)) {
				this.navigateToNtiid(newBase, newFragment);
				return true;
			}

			//Is href an exteranl url whose base does not match the current base (i.e. not in our app)?
			if (ContentUtils.isExternalUri(href) &&
				(newBase.indexOf(currentBase) !== 0 || (/\/content\//.test(href) && !/\.html$/.test(href)))) {
				try {
					window.open(href, '_blank');
				}
				catch (er) {
					console.error('Unable to open ', href, 'with target _blank.', Globals.getError(href));
				}
				return true;
			}

			console.error('Expected href to be an interal url/hash change but it was', href, currentLocation);
			return false;
		}
	},


	constructor: function() {
		this.store = NextThought.app.navigation.StateStore.getInstance();
	},


	/**
	 * Takes an object config
	 *
	 * cmp: Ext.Component, //a component to render in the header, tabs are ignored if this is present
	 * hideBranding: Boolean, //if true hide the environment branding and show a back button
	 * noLibraryLink: Boolean, //if true don't let the branding link to the library
	 * noRouteOnSearch: Boolean, //if true don't do a navigation on search, should really only be used by the search route
	 *
	 * @param  {Object} configuration to build the nav
	 */
	updateNavBar: function(config) {
		this.store.updateNavBar(config);
	},


	/**
	 * Sets the bundle to show as active and adds it to the recent content switcher
	 *
	 * TODO: will this always be a bundle, or will we have something here for everything
	 * you look at (i.e. profile).
	 *
	 * @param {Bundle} bundle the bundle to set active
	 */
	setActiveContent: function(bundle, masked) {
		this.store.fireEvent('set-active-content', bundle, masked);
	}
});
