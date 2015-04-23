Ext.define('NextThought.app.navigation.Actions', {
	extend: 'NextThought.common.Actions',

	requires: ['NextThought.app.navigation.StateStore'],


	constructor: function() {
		this.store = NextThought.app.navigation.StateStore.getInstance();
	},


	/**
	 * Takes an array or object config
	 *
	 * {
	 * 	backHandler: Function, //if falsy or we have an array of tab configs don't show the back arrow
	 * 	cmp: Ext.Component, //a component to render in the header, tabs are ignored if this is present
	 *  tabs: [
	 *  	{
	 *  		name: String, //Display name of this option
	 *  		cls: String, //custom class to add to the tab
	 *  		handler: Function, //Called when the tab is clicked
	 *  		menuItems: [ //Nested tab configs to show under this one
	 *  			{
	 *  				name: String,
	 *  				cls: Stirng,
	 *  				handler: Function
	 *  			}
	 *  		]
	 *  	}
	 *  ]
	 * }
	 *
	 * @param  {Array|Object} tabs configuration to build the tabs
	 */
	updateNavBar: function(config) {
		this.store.fireEvent('set-tabs', tabs);
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
