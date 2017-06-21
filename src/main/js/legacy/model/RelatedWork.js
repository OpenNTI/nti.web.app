const Ext = require('extjs');
const Mime = require('mime-types');

const DomUtils = require('legacy/util/Dom');
const Globals = require('legacy/util/Globals');

require('legacy/mixins/AuditLog');
require('legacy/mixins/AuditLog');
require('./Base');


module.exports = exports = Ext.define('NextThought.model.RelatedWork', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.relatedworkref',
	isPage: true,

	mixins: {
		auditLog: 'NextThought.mixins.AuditLog'
	},

	statics: {
		mimeType: 'application/vnd.nextthought.relatedworkref'
	},

	inheritableStatics: {

		fromOutlineNode: function (data) {
			return this.create({
				description: data.description,
				icon: data.thumbnail,
				label: data.title,
				Creator: data.creator,
				NTIID: data.ntiid,
				href: data.href,
				byline: data.creator,
				'Target-NTIID': data['Target-NTIID'],
				targetMimeType: data.targetMimeType
			});
		},

		CONTENT_TYPE: 'application/vnd.nextthought.content',
		EXTERNAL_TYPE: 'application/vnd.nextthought.externallink',
		EMBEDABLE_TYPES: {
			'application/pdf': true,
			'application/x-pdf': true
		},

		FILE_ICON_BASE: '/app/resources/images/file-icons/',

		MIMETYPE_TO_ICON: {
			'application/msword': 'icon-doc.png',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'icon-docx.png',
			'application/pdf': 'icon-pdf.png',
			'application/x-pdf': 'icon-pdf.png',
			'application/vnd.ms-powerpoint': 'icon-ppt.png',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'icon-pptx.png',
			'application/vnd.ms-excel': 'icon-xls.png',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'icon-xlsx.png',
			'application/zip': 'icon-zip.png',
			'application/vnd.nextthought.externallink': 'icon-www.png',
			'application/vnd.nextthought.content': 'generic.png',
			'unknown': 'generic.png'
		},

		FILE_FALLBACK_BLANK_IMAGE: 'blank-download.png',


		URL_ICON: 'icon-www.png',

		isImageFile: function (mimeType) {
			const extension = mimeType && mimeType.split('/').last();
			const isImage = extension && /^(png|jpg|jpeg|gif|tiff|bmp)$/i.test(extension);
			return !!isImage;
		},


		isContent (mimeType) {
			return mimeType === 'application/vnd.nextthought.content';
		},


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


		hasIconForMimeType: function (mimeType) {
			return !!this.MIMETYPE_TO_ICON[mimeType];
		},


		getIconForURL: function () {
			var base = this.FILE_ICON_BASE,
				icon = this.URL_ICON;

			return base + icon;
		}
	},

	fields: [
		{name: 'description', type: 'string'},
		{name: 'icon', type: 'string'},
		{name: 'label', type: 'string'},
		{name: 'title', type: 'string'},
		{name: 'section', type: 'string'},
		{name: 'target', type: 'string'},
		{name: 'type', type: 'string'},
		{name: 'visibility', type: 'string'},
		{name: 'href', type: 'string'},
		{name: 'Target-NTIID', type: 'string'},
		{name: 'target-NTIID', type: 'string'},
		{name: 'targetMimeType', type: 'string'},
		{name: 'byline', type: 'string'},
		{name: 'ContentFile', type: 'SingleItem'}
	],

	asDomData: function (root) {
		var data = {
			ntiid: this.get('NTIID'),
			href: this.getHref(),
			icon: this.getIcon(root),
			label: this.get('label'),
			title: this.get('label'),
			description: this.get('description'),
			byline: this.get('byline'),
			creator: this.get('byline'),
			targetNTIID: this.get('target-NTIID'),
			targetMimeType: this.get('targetMimeType')
		};

		data['attribute-data-href'] = Globals.getURLRooted(data.href, root);
		data.icon = data.icon && data.icon.url;
		data.noTarget = !Globals.shouldOpenInApp(data.ntiid, data.href, null, data.targetMimeType);
		data.domSpec = DomUtils.asDomSpec.call(data);

		return data;
	},


	getHref () {
		let contentFile = this.get('ContentFile');

		return (contentFile && contentFile.getSrc ()) || this.get('href');
	},

	/**
	 * If the ref is pointing to content.
	 *
	 * Consider it content if:
	 *
	 * 1.) If the Target-MimeType is application/vnd.nextthought.content
	 *
	 * @return {Boolean} true if content link
	 */
	isContent: function () {
		return this.self.CONTENT_TYPE === this.get('type');
	},

	/**
	 * If the ref is pointing to an external link.
	 *
	 * Consider it an external link if:
	 *
	 * 1.) If the Target-MimeType is application/vnd.nextthought.externallink
	 *
	 * @return {Boolean} true if external link
	 */
	isExternalLink: function () {
		return this.self.EXTERNAL_TYPE === this.get('type');
	},

	/**
	 * If the ref is pointing to a document that can be embedded in the app
	 *
	 * Consider it an embeddable document if:
	 *
	 * 1.) It is a document
	 * 2.) Its a type we recognize as embeddable
	 *
	 * @return {Boolean} [description]
	 */
	isEmbeddableDocument: function () {
		var type = this.get('type');

		return this.isDocument() && this.self.EMBEDABLE_TYPES[type];
	},

	/**
	 * If the ref is pointing to a document.
	 *
	 * Consider it a document if:
	 *
	 * 1.) It is not a content link
	 * 2.) It is not an external link
	 *
	 * @return {Boolean} [description]
	 */
	isDocument: function () {
		return !this.isContent() && !this.isExternalLink();
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
			targetMimeType = this.get('targetMimeType'),
			data = {};

		if (icon && Globals.ROOT_URL_PATTERN.test(icon)) {
			data.url = Globals.getURL(icon);
		} else if (icon) {
			data.url = Globals.getURL(icon, root || '');
		}
		else if (!icon && this.self.isImageFile(targetMimeType)) {
			data.url = Globals.getURL(this.get('thumbnail'));
		}

		if (!data.url) {
			data = this.self.getIconForMimeType(targetMimeType);
		}
		return data;
	},

	/**
	 * Resolve the icon to the content package if we don't have one set
	 *
	 * @param  {String} root   the base rot
	 * @param  {Object} bundle the bundle to look in
	 * @return {Promise}        fulfills with the a object that has url, extension, and icon cls
	 */
	resolveIcon (root, bundle) {
		const icon = this.get('icon');
		const targetMimeType = this.get('targetMimeType');

		if (!this.self.isContent(targetMimeType) || icon) {
			return Promise.resolve(this.getIcon(root));
		}

		return bundle.getContentPackageContaining(this.get('target-NTIID'))
			.then((contentPackage) => {
				const contentIcon = contentPackage.isRenderableContentPackage && contentPackage.get('icon');

				return contentIcon ? {url: contentIcon} : this.getIcon(root);
			});
	},

	getTitle: function () {
		return this.isContent() ? '' : this.get('label');
	},

	shouldBeRoot: function () {
		return !this.isContent();
	}
});
