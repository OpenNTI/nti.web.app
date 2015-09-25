export default Ext.define('NextThought.mixins.PresentationResources', {
	ASSET_MAP: {
		thumb: {
			check: false,
			name: 'contentpackage-thumb-60x60.png'
		},
		landing: {
			check: false,
			name: 'contentpackage-landing-232x170.png'
		},
		background: {
			check: false,
			name: 'background.png'
		},
		vendorIcon: {
			check: true,
			name: 'vendoroverrideicon.png'
		}
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
		var assetPath = this.ASSET_MAP[name] || {name: ('missing-' + name + '-asset.png')},
			root = this.getAssetRoot(),
			url = root && root.concatPath(assetPath.name),
			p;

		if (Ext.isEmpty(root)) {
			p = Promise.reject('No root');
		} else if (assetPath.check) {
			p = Service.request({
					method: 'HEAD',
					url: url
				})
				.then(function() {
					return url;
				})
				.fail(function() {
					return Promise.reject(name + ' asset not found');
				});
		} else {
			p = Promise.resolve(url);
		}

		return p;
	}

});
