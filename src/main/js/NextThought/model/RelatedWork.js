Ext.define('NextThought.model.RelatedWork', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.relatedworkref',

	isPage: true,

	CONTENT_TYPE: 'application/vnd.nextthought.content',

	statics: {
		mimeType: 'application/vnd.nextthought.relatedworkref',

		fromOutlineNode: function(data) {
			return this.create({
				description: data.description,
				icon: data.thumbnail,
				label: data.title,
				Creator: data.creator,
				NTIID: data.ntiid,
				href: data.href
			});
		},

		FILE_ICON_BASE: '/app/resources/images/file-icons/',

		MIMETYPE_TO_ICON: {
			'application/msword': 'icon-doc.png',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.template': 'icon-docx.png',
			'application/pdf': 'icon-pdf.png',
			'application/x-pdf': 'icon-pdf.png',
			'application/vnd.ms-powerpoint': 'icon-ppt.png',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'icon-pptx.png',
			'application/vnd.ms-excel': 'icon-xls.png',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'icon-xlsx.png',
			'application/zip': 'icon-zip.png',
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
		{name: 'section', type: 'string'},
		{name: 'target', type: 'string'},
		{name: 'type', type: 'string'},
		{name: 'visibility', type: 'string'},
		{name: 'href', type: 'string'},
		{name: 'Target-NTIID', type: 'string'},
		{name: 'byline', type: 'string'}
	],


	asDomData: function(root) {
		var data = {
				ntiid: this.get('NTIID'),
				href: this.get('href'),
				icon: this.get('icon'),
				label: this.get('label'),
				description: this.get('description')
			};

		data['attribute-data-href'] = Globals.getURLRooted(data.href, root);
		data.noTarget = !Globals.shouldOpenInApp(data.ntiid, data.href);
		data.domSpec = DomUtils.asDomSpec.call(data);

		return data;
	},


	isContentRef: function() {
		return this.CONTENT_TYPE === this.get('type');
	},


	getIcon: function() {
		return this.get('icon');
	},


	getTitle: function() {
		return this.isContentRef() ? '' : this.get('label');
	},


	shouldBeRoot: function() {
		return !this.isContentRef();
	}
});
