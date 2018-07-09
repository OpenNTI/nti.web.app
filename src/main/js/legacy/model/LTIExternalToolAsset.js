const Ext = require('@nti/extjs');
const Mime = require('mime-types');

const Globals = require('legacy/util/Globals');

require('./Base');

module.exports = exports = Ext.define('NextThought.model.LTIExternalToolAsset', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.ltiexternaltoolasset',
	isPage: true,

	statics: {
		mimeType: 'application/vnd.nextthought.ltiexternaltoolasset',
	},

	inheritableStatics: {

		fromOutlineNode: function (data) {
			return this.create({
				description: data.description,
				icon: data.thumbnail,
				title: data.title,
				ConfiguredTool: data.ConfiguredTool,
				NTIID: data.ntiid,
				'launch_url': data['launch_url']
			});
		},

		FILE_ICON_BASE: '/app/resources/images/file-icons/',

		MIMETYPE_TO_ICON: {
			'application/vnd.nextthought.ltiexternaltoolasset': 'icon-lti.jpeg'
		},

		FILE_FALLBACK_BLANK_IMAGE: 'blank-download.png',

		URL_ICON: 'icon-lti.jpeg',

		getIconForMimeType: function (mimeType) {
			var base = this.FILE_ICON_BASE,
				icon = this.MIMETYPE_TO_ICON[mimeType],
				data = {};

			if (icon) {
				data.url = base + icon;
			}
			else {
				let extension = Mime.extension(mimeType);
				extension = extension && !/^(www|bin|application\/octet-stream)$/i.test(extension) ? extension : '';

				// Only if we got  a false from the extension function, should we try to use the last part of the extension.
				if (extension === false) {
					extension = (mimeType || '').split('/').last();
				}
				data.url = this.getFallbackIcon();
				data.extension = extension;
				data.iconCls = 'fallback';
			}

			return data;
		},

		getFallbackIcon: function () {
			return this.FILE_ICON_BASE + this.FILE_FALLBACK_BLANK_IMAGE;
		},

		getIconForURL: function () {
			var base = this.FILE_ICON_BASE,
				icon = this.URL_ICON;

			return base + icon;
		}
	},

	fields: [
		{name: 'title', type: 'string'},
		{name: 'description', type: 'string'},
		{name: 'ConfiguredTool', type: 'object'},
		{name: 'icon', type: 'string'},
		{name: 'launch_url', type: 'string'}
	],

	asDomData: function (root) {
		var data = {
			ntiid: this.get('NTIID'),
			icon: this.getIcon(root),
			title: this.get('title'),
			description: this.get('description'),
		};

		data.icon = data.icon && data.icon.url;

		return data;
	},

	/**
	 *
	 * Get or generate the icon data for a related work.
	 * @param {String} root - the base root.
	 * @return {Object}	- The icon data object will have the following fields:
	 * - url: The url for the icon. This field is required.
	 * - extension: the extension of a file. Required for the case where we have to generate the icon.
	 * - iconCls: extra cls that we may add to an icon.
	 */
	getIcon: function (root) {
		var icon = this.get('icon'),
			data = {};

		if (icon && Globals.ROOT_URL_PATTERN.test(icon)) {
			data.url = Globals.getURL(icon);
		} else if (icon) {
			data.url = Globals.getURL(icon, root || '');
		}

		if (!data.url) {
			data = this.self.getIconForMimeType(this.get('MimeType'));
		}
		return data;
	},

	/**
	 * Resolve the icon to the content package if we don't have one set
	 * @param {String} root - the base root.
	 * @return {Promise}        fulfills with the a object that has url, extension, and icon cls
	 */
	resolveIcon (root) {

		return Promise.resolve(this.getIcon(root));

	},

});
