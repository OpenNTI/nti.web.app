Ext.define('NextThought.mixins.PresentationResources', {
	ASSET_MAP: {
		thumb: 'contentpackage-thumb-60x60.png',
		landing: 'contentpackage-landing-232x170.png'
	},


	/**
	 * return the root that should be used if PlatforPresentationResources isn't defined
	 * @return {string} default root to use
	 * @override
	 */
	getDefaultAssetRoot: function() {},


	getAssetRoot: function() {
		if (this.presentationroot) { return this.presentationroot; }

		var presResources = (this.get && this.get('PlatformPresentationResources')) || [],
			root;

		presResources.forEach(function(resource) {
			if (resource.PlatformName === 'webapp') {
				root = resource.href;
			}
		});

		this.presentationroot = root ? getURL(root) : this.getDefaultAssetRoot();

		return this.presentationroot;
	},


	/**
	 * builds the url for the asset and returns a promise that fulfills if the img loads or rejects if it fails.
	 * @param  {string} name asset name to load
	 * @return {Promise} whether or not the asset exists
	 */
	getImgAsset: function(name) {
		var assetPath = this.ASSET_MAP[name] || 'missing-asset.png',
			root = this.getAssetRoot(),
			url = root && root.concatPath(assetPath),
			img = new Image();

		if (Ext.isEmpty(root)) {
			return Promise.reject('No root');
		}

		return Service.request({
			method: 'HEAD',
			url: url
		})
			.then(function() {
				return url;
			})
			.fail(function() {
				return Promise.reject(name + ' asset not found');
			});
	}

});
