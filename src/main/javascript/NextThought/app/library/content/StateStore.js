Ext.define('NextThought.app.library.content.StateStore', {
	extend: 'NextThought.common.StateStore',

	CONTENT_PACKAGES: [],
	CONTENT_BUNDLES: [],


	getContentPackages: function() {
		return this.CONTENT_PACKAGES;
	},

	
	getContentBundles: function() {
		return this.CONTENT_BUNDLES;
	},


	setContentPackages: function(packages) {
		this.CONTENT_PACKAGES = packages;

		this.fireEvent('content-packages-set', packages);
	},


	setContentBundles: function(bundles) {
		this.CONTENT_BUNDLES = bundles;

		this.fireEvent('content-bundles-set', bundles);
	}
});
