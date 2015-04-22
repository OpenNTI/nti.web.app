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
	},


	getTitle: function(index) {
		var title, i, packages = this.CONTENT_PACKAGES, content;

		for(i = 0; i < packages.length; i++) {
			content = packages[i];

			if (content.get('index') === index || content.get('NTIID') === index) {
				return content;
			}
		}
	}
});
