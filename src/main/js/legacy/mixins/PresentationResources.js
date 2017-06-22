const Ext = require('extjs');

const {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.mixins.PresentationResources', {
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
		},
		promoImage: {
			check: true,
			name: 'course-promo-large-16x9.png'
		}
	},


	/*
	 * return the root that should be used if PlatforPresentationResources isn't defined
	 * @return {string} default root to use
	 * @override
	 */
	getDefaultAssetRoot: function () {},


	getAssetRoot: function () {
		if (this.presentationroot) { return this.presentationroot; }

		var presResources = (this.get && this.get('PlatformPresentationResources')) || [],
			root;

		presResources.forEach(function (resource) {
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
	getImgAsset: function (name) {
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
				.then(function () {
					return url;
				})
				.catch(function () {
					return Promise.reject(name + ' asset not found');
				});
		} else {
			p = Promise.resolve(url);
		}

		return p;
	},


	/**
	 * Keep track of which assets we have checked existed, so we don't do
	 * it more than once
	 *
	 * @param  {String} key	  field to store the value on
	 * @param  {String} asset the name of the asset (defaults to the key arg)
	 * @return {Promise}	  fulfills once the asset has been found to exist or not
	 */
	__ensureAsset: function (key, asset) {
		var existing = null,
			me = this;

		if (!this.__assetPromises) {
			this.__assetPromises = {};
		}

		existing = this.__assetPromises[key];

		if (!existing) {
			existing = this.getImgAsset(asset || key).then(function (url) { me.set(key, url); return url; }, me.set.bind(me, [key, null]));
			this.__assetPromises[key] = existing;
		}

		return existing;
	},


	/**
	 * Return the url for the asset if the asset exists
	 * @param  {String} key	  field to store the value on
	 * @param  {String} asset the name of the asset (defaults to key arg)
	 * @return {Promise}	  fulfills with the url to the asset if it exists
	 */
	getAsset: function (key, asset) {
		return this.__ensureAsset(key, asset);
	}
});
