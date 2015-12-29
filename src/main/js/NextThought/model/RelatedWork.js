Ext.define('NextThought.model.RelatedWork', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.relatedworkref',

	isPage: true,


	statics: {
		mimeType: 'application/vnd.nextthought.relatedworkref',

		fromOutlineNode: function(data) {
			return this.create({
				description: data.description,
				icon: data.thumbnail,
				label: data.title,
				Creator: data.creator,
				NTIID: data.ntiid,
				href: data.href,
				byline: data.byline,
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
			'unknown': 'generic.png'
		},


		URL_ICON: 'icon-www.png',


		getIconForMimeType: function(mimeType) {
			var base = this.FILE_ICON_BASE,
				icon = this.MIMETYPE_TO_ICON[mimeType] || this.MIMETYPE_TO_ICON['unknown'];

			return base + icon;
		},


		getIconForURL: function() {
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
		{name: 'targetMimeType', type: 'string'},
		{name: 'byline', type: 'string'}
	],


	asDomData: function(root) {
		var data = {
				ntiid: this.get('NTIID'),
				href: this.get('href'),
				icon: this.get('icon'),
				label: this.get('label'),
				description: this.get('description'),
				targetMimeType: this.get('targetMimeType')
			};

		data['attribute-data-href'] = Globals.getURLRooted(data.href, root);
		data.noTarget = !Globals.shouldOpenInApp(data.ntiid, data.href, null, data.targetMimeType);
		data.domSpec = DomUtils.asDomSpec.call(data);

		return data;
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
	isContent: function() {
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
	isExternalLink: function() {
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
	isEmbeddableDocument: function() {
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
	isDocument: function() {
		return !this.isContent() && !this.isExternalLink();
	},


	getIcon: function(root) {
		var icon = this.get('icon'),
			targetMimeType = this.get('targetMimeType');

		if (icon && Globals.ROOT_URL_PATTERN.test(icon)) {
			icon = getURL(icon);
		} else if (icon) {
			icon = getURL(root || '', icon);
		} else if (this.self.getIconForMimeType) {
			icon = this.self.getIconForMimeType(targetMimeType);
		}

		return icon;
	},


	getTitle: function() {
		return this.isContent() ? '' : this.get('label');
	},


	shouldBeRoot: function() {
		return !this.isContent();
	}
});
