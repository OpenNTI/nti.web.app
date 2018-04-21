const Ext = require('@nti/extjs');

const {getURL} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.mixins.PresentationResources', {
	ASSET_MAP: {
		thumb: {
			check: true,
			name: 'contentpackage-thumb-60x60.png'
		},
		landing: {
			check: true,
			name: 'contentpackage-landing-232x170.png'
		},
		background: {
			check: true,
			name: 'background.png'
		},
		vendorIcon: {
			check: true,
			errorOnNotFound: true,
			name: 'vendoroverrideicon.png'
		},
		promoImage: {
			check: true,
			errorOnNotFound: true,
			name: 'course-promo-large-16x9.png'
		}
	},


	/*
	 * return the root that should be used if PlatforPresentationResources isn't defined
	 * @return {string} default root to use
	 * @override
	 */
	getDefaultAssetRoot: function () {
		return '/app/resources/images/default-course/';
	},


	getPresentationResource () {
		const resources = (this.get && this.get('PlatformPresentationResources')) || [];

		for (let resource of resources) {
			if (resource.PlatformName === 'webapp') {
				return resource;
			}
		}

		return null;
	},


	getAssetRoot: function () {
		if (this.presentationroot) { return this.presentationroot; }

		const resource = this.getPresentationResource();

		const rootPath = resource && (resource.root || resource.href);

		this.presentationroot = rootPath ? getURL(rootPath) : this.getDefaultAssetRoot();

		return this.presentationroot;
	},


	getLastModified () {
		const resource = this.getPresentationResource();

		return resource ? resource['Last Modified'] : 0;
	},


	/**
	 * builds the url for the asset and returns a promise that fulfills if the img loads or rejects if it fails.
	 * @param  {string} name asset name to load
	 * @return {Promise} whether or not the asset exists
	 */
	getImgAsset: function (name) {
		var assetPath = this.ASSET_MAP[name] || {name: ('missing-' + name + '-asset.png')},
			root = this.getAssetRoot(),
			lastMod = this.getLastModified(),
			url = `${root && root.concatPath(assetPath.name)}?t=${lastMod}`,
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
					if(assetPath.errorOnNotFound) {
						return Promise.reject(name + ' asset not found');
					}

					// use default landing/background/thumb for courses that don't have images
					return '/app/resources/images/default-course/' + assetPath.name;
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
