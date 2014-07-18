Ext.define('NextThought.model.ContentBundle', {
	alternateClassName: 'NextThought.model.ContentPackageBundle',
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.forums.ContentBoard'
	],

	mixins: {
		'PresentationResources': 'NextThought.mixins.PresentationResources'
	},

	isBundle: true,

	fields: [
		{ name: 'ContentPackages', type: 'arrayItem' },
		{ name: 'DCCreator', type: 'auto' },
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },

		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator'},

		{ name: 'PlatformPresentationResources', type: 'auto' },
		{ name: 'contributors', type: 'auto' },
		{ name: 'created', type: 'ISODate' },
		{ name: 'creators', type: 'auto' },
		{ name: 'description', type: 'string' },
		{ name: 'modified', type: 'ISODate' },
		{ name: 'ntiid', type: 'string' },
		{ name: 'publisher', type: 'string' },
		{ name: 'root', type: 'string' },
		{ name: 'subjects', type: 'auto' },
		{ name: 'title', type: 'string' },
		{ name: 'Title', type: 'string', mapping: 'title' },

		{ name: 'icon', type: 'string' },
		{ name: 'thumb', type: 'string' }
	],


	statics: {
		fromPackage: function(contentPackage) {
			var id = contentPackage.get('NTIID') + '-auto-bundle',
				reader = ParseUtils.getReaderFor({MimeType: 'application/vnd.nextthought.contentbundle'}),
				data = Ext.applyIf({ ContentPackages: [contentPackage], href: '/' }, contentPackage.raw),
				convertedValues,
				record = this.create(undefined, id, data, convertedValues = {});
			reader.convertRecordData(convertedValues, data, record);
			return record;
		}
	},


	constructor: function() {
		this.callParent(arguments);
		wait().then(this.__setImage.bind(this));
	},


	asUIData: function() {
		return {
			id: this.getId(),
			isBundle: true,
			title: this.get('title'),
			label: this.get('author'),
			icon: this.get('icon'),
			thumb: this.get('thumb')
		};
	},


	getDefaultAssetRoot: function() {
		var root = this.get('root');

		if (!root) {
			console.error('No root for content bundle: ', this);
			return '';
		}

		return getURL(root).concatPath('/presentation-assets/webapp/v1/');
	},


	__setImage: function() {
		var me = this;

		function fallback() {
			var e = me.get('ContentPackages')[0];
			me.set('icon', getURL(e.get('icon')));
		}

		me.getImgAsset('landing')
			.then(function(url) { me.set('icon', url); }, fallback);
		me.getImgAsset('thumb')
			.then(function(url) { me.set('thumb', url); }, fallback);
	},


	__getLocationInfo: function() {
		var locationInfo = ContentUtils.getLocation(this.get('ContentPackages')[0]);
		//add a reference to myself so the course tiles can get the course instance form the locationInfo for now
		if (locationInfo) {
			locationInfo.bundle = this;
		}

		return locationInfo;
	},


	getFirstPage: function() {
		var e = this.get('ContentPackages')[0];
		return e && e.get('NTIID');
	},


	fireNavigationEvent: function(eventSource) {
		var me = this;
		return new Promise(function(fulfill) {
			eventSource.fireEvent('bundle-selected', me, function() {
				fulfill();
			});
		});
	},


	getDiscussionBoard: function() {
		var me = this,
			link = me.getLink('DiscussionBoard'),
			//get the cached request, or make a new one.
			p = me.__BoardResolver || (((link && Service.request(link)) || Promise.reject('No Discussion Board Link'))
					//parse
				.then(ParseUtils.parseItems.bind(ParseUtils))
					//unwrap from the array
				.then(function(items) {
					if (items.length > 1) {console.warn('Too many items found.');}
					return items[0];
				})
					//if we fail, delete the cached promise, and resume failure. :P
				.fail(function(reason) {
					delete me.__BoardResolver;
					return Promise.reject(reason);
				}));

		//cache the current request
		this.__BoardResolver = p;

		return p;
	}
});
