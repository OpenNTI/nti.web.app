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
