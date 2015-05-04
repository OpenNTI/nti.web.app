Ext.define('NextThought.app.navigation.Actions', {
	extend: 'NextThought.common.Actions',

	requires: ['NextThought.app.navigation.StateStore'],


	constructor: function() {
		this.store = NextThought.app.navigation.StateStore.getInstance();
	},


	/**
	 * Takes an object config
	 *
	 * 
	 * 	cmp: Ext.Component, //a component to render in the header, tabs are ignored if this is present
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
	setActiveContent: function(bundle) {
		this.store.fireEvent('set-active-content', bundle);
	}
});
