Ext.define('NextThought.model.ContentBundle', {
	alternateClassName: 'NextThought.model.ContentPackageBundle',
	extend: 'NextThought.model.Base',

	requires: [
		'NextThought.model.forums.ContentBoard'
	],

	mixins: {
		'BundleLike': 'NextThought.mixins.BundleLike',
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
		{ name: 'thumb', type: 'string' },
		{ name: 'background', type: 'string'}
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
		var root = ([this].concat(this.get('ContentPackages')))
				.reduce(function(agg, o) {
					return agg || o.get('root');
				}, null);

		if (!root) {
			console.error('No root for content bundle: ', this);
			return '';
		}

		return getURL(root).concatPath('/presentation-assets/webapp/v1/');
	},


	__setImage: function() {
		var me = this;

		me.getImgAsset('landing')
			.then(function(url) { me.set('icon', url); }, me.set.bind(me, ['icon', null]));
		me.getImgAsset('thumb')
			.then(function(url) { me.set('thumb', url); }, me.set.bind(me, ['thumb', null]));
		me.getImgAsset('background')
			.then(function(url) { me.set('background', url); }, me.set.bind(me, 'background', null));
	},


	getBackgroundImage: function() {
		return this.get('background');
	},


	getLocationInfo: function() {
		var data = this.asUIData(),
			firstPackage = this.get('ContentPackages')[0],
			firstPage = this.getFirstPage(),
			toc = firstPackage.get('toc');

		return !toc ? null : Ext.applyIf({
				toc: toc,
				location: toc.documentElement,
				NTIID: firstPage,
				ContentNTIID: firstPackage,
				title: firstPackage,
				root: firstPackage.get('root'),
				getIcon: function() { return data.icon; },
				getPathLabel: function() { return Promise.resolve(data.title); }
			}, data);
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


	getPublicScope: function() { return this.getScope('public'); },
	getRestrictedScope: function() { return this.getScope('restricted'); },//i don't think this is used


	getScope: function(scope) {
		var s = (this.get('Scopes') || {})[scope] || '';
		if (typeof s === 'string') {
			s = s.split(' ');
		}
		return s.filter(function(v) {return !Ext.isEmpty(v);});
	},

	/**
	 * See getForumList in CourseInstance for more details
	 * @return {Object} a forum list of the contents of this board
	 */
	getForumList: function() {
		var me = this,
			b;

		me.resolveBoard()
			.then(function(board) {
				var contents = board.getLink('contents');

				b = board;

				return Service.request(contents);
			})
			.then(function(json) {
				json = JSON.parse(json);
				json.Items = ParseUtils.parseItems(json.Items);

				var store = NextThought.model.forums.Board.buildContentsStoreFromDate(me.getId() + '-board', json.Items);

				return [{
					title: '',
					store: store,
					board: b
				}];
			});
	},


	resolveBoard: function() {
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
	},

	represents: function(catalogEntry) {return false;}
});
