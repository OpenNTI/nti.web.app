const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const lazy = require('internal/legacy/util/lazy-require')
	.get('ParseUtils', () => require('internal/legacy/util/Parsing'))
	.get('ContentUtils', () => require('internal/legacy/util/Content'));

const ForumsBoard = require('./forums/Board');

require('internal/legacy/mixins/BundleLike');
require('internal/legacy/mixins/PresentationResources');
require('./Base');
require('./forums/ContentBoard');
require('./ContentPackage');
require('./RenderableContentPackage');

module.exports = exports = Ext.define('NextThought.model.ContentBundle', {
	alternateClassName: 'NextThought.model.ContentPackageBundle',
	extend: 'NextThought.model.Base',
	mimeType: [
		'application/vnd.nextthought.contentpackagebundle',
		'application/vnd.nextthought.coursecontentpackagebundle',
		'application/vnd.nextthought.contentbundle',
		'application/vnd.nextthought.publishablecontentpackagebundle',
	],

	mixins: {
		BundleLike: 'NextThought.mixins.BundleLike',
		PresentationResources: 'NextThought.mixins.PresentationResources',
	},

	isBundle: true,

	fields: [
		{ name: 'ContentPackages', type: 'arrayItem' },
		{
			name: 'LegacyContentPackages',
			type: 'array',
			convert: (v, r) => {
				return (r.get('ContentPackages') || []).filter(
					x => !x.isRenderableContentPackage
				);
			},
		},
		{
			name: 'RenderableContentPackages',
			type: 'array',
			convert: (v, r) => {
				return (r.get('ContentPackages') || []).filter(
					x => x.isRenderableContentPackage
				);
			},
		},
		{ name: 'DCCreator', type: 'auto' },
		{ name: 'DCDescription', type: 'string' },
		{ name: 'DCTitle', type: 'string' },

		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator' },

		{ name: 'PlatformPresentationResources', type: 'auto' },
		{ name: 'contributors', type: 'auto' },
		{ name: 'created', type: 'ISODate' },
		{ name: 'creators', type: 'auto' },
		{ name: 'byline', type: 'auto' },
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
		{ name: 'background', type: 'string' },
		{ name: 'vendorIcon', type: 'string' },
	],

	statics: {
		fromPackage: function (contentPackage) {
			var id = contentPackage.get('NTIID') + '-auto-bundle',
				reader = lazy.ParseUtils.getReaderFor({
					MimeType: 'application/vnd.nextthought.contentbundle',
				}),
				data = Ext.applyIf(
					{ ContentPackages: [contentPackage], href: '/' },
					contentPackage.raw
				),
				convertedValues,
				record = this.create(
					undefined,
					id,
					data,
					(convertedValues = {})
				);
			reader.convertRecordData(convertedValues, data, record);
			return record;
		},
	},

	constructor: function () {
		this.callParent(arguments);

		//this.onceAssetsLoaded = wait().then(this.__setImage.bind(this));
	},

	allowPathSiblings: function () {
		return true;
	},

	onceAssetsLoadedPromise: function () {
		if (!this.onceAssetsLoaded) {
			this.onceAssetsLoaded = wait().then(this.__setImage.bind(this));
		}
		return this.onceAssetsLoaded;
	},

	asUIData: function () {
		return {
			id: this.getId(),
			isBundle: true,
			title: this.get('title'),
			label: this.get('byline') || this.get('author'), //TODO: delete this line when we know uiData.label is not referenced. (I'm 90% sure its not already.)
			author: this.get('author'),
			byline: this.get('byline'),
			icon: this.get('icon'),
			thumb: this.get('thumb'),
			vendorIcon: this.get('vendorIcon'),
		};
	},


	__setImage: function () {
		var me = this;

		//do a head request to make sure the assets exist
		return Promise.all([
			me.getBackgroundImage(),
			me.getVendorIcon(),
			me.getIconImage(),
			me.__ensureAsset('thumb'),
		]);
	},

	/**
	 * Return a promise that fulfills with the background image,
	 * its a promise so the head requests have a change to fail so we can fall back
	 * if the images aren't there
	 * @returns {Promise} fulfills with the url
	 */
	getBackgroundImage: function () {
		return this.getAsset('background');
	},

	getVendorIcon: function () {
		return this.getAsset('vendorIcon');
	},

	getIconImage: function () {
		return this.getAsset('icon', 'landing');
	},

	getThumbnail: function () {
		return this.getAsset('thumb');
	},

	getTocFor(contentPackageID, status) {
		const p = this.getContentPackage(contentPackageID);

		return Promise.resolve(p && p.getToc(status));
	},

	getToCs: function (status) {
		var packages = this.get('ContentPackages');

		packages = packages.map(function (pack) {
			return pack.getToc(status).catch(() => null);
		});

		return Promise.all(packages).then(results => {
			return results.filter(x => x);
		});
	},

	getTitle: function () {
		return this.get('Title');
	},

	getByline: function () {
		return this.get('byline');
	},

	getIcon: function () {
		return this.get('icon');
	},

	getContentPackageContaining(id) {
		return lazy.ContentUtils.getContentPackageContainingReading(id, this);
	},

	__addContentPackage(contentPackage) {
		if (this.__contentPackages) {
			this.__contentPackages = [...this.__contentPackages, contentPackage];
		}
	},

	async syncContentPackage(contentPackage) {
		const original = await this.getContentPackage(contentPackage.get('NTIID'));

		if (original) {
			original.syncWith(contentPackage);
		} else {
			this.__addContentPackage(contentPackage);
		}
	},

	async hasContentPackage(id) {
		const contentPackage = await this.getContentPackage(id);

		return !!contentPackage;
	},

	async getContentPackage(id) {
		const packages = await this.getContentPackages();

		for (let p of packages) {
			if (p.get('NTIID') === id || p.get('OID') === id) {
				return p;
			}
		}
	},

	getContentPackages: function () {
		return Promise.resolve((this.get('ContentPackages')));
		// return this.get('ContentPackages');
	},

	async getLegacyContentPackages () {
		const packages = await this.getContentPackages();

		return packages.filter(p => !p.isRenderableContentPackage);
	},

	async getContentRoots () {
		const packages = await this.getContentPackages();

		return packages.map(function (content) {
			return content && content.get('root');
		});
	},

	async getNonRenderableContentRoots() {
		const packages = await this.getContentPackages();

		return packages
			.filter(content => !content.isRenderableContentPackage)
			.map(content => content && content.get('root'));
	},

	async getContentIds () {
		const packages = await this.getContentPackages();

		return packages.map(function (content) {
			return content && content.get('NTIID');
		});
	},

	async getPresentationProperties (id) {
		const packages = await this.getContentPackages();

		for (let content of packages) {
			if (content.get('NTIID') === id) {
				return content.get('PresentationProperties');
			}
		}
	},

	async getLocationInfo (status) {
		const packages = await this.getLegacyContentPackages();

		var firstPackage = packages[0],
			firstPage = this.getFirstPage(),
			uiData = this.asUIData();

		const tocRequest = firstPackage
			? firstPackage.getToc(status)
			: Promise.resolve();

		return tocRequest.then(function (toc) {
			if (!toc) {
				return null;
			}

			return Ext.applyIf(
				{
					toc: toc,
					location: toc.documentElement,
					NTIID: firstPage,
					ContentNTIID: firstPackage,
					title: firstPackage,
					root: firstPackage.get('root'),
					getIcon: () => uiData.icon,
					getPathLabel: () => Promise.resolve(uiData.title),
				},
				uiData
			);
		});
	},

	async getFirstPage () {
		const packages = await this.getContentPackages();

		var e = packages[0];
		return e && e.get('NTIID');
	},

	fireNavigationEvent: function (eventSource) {
		var me = this;
		return new Promise(function (fulfill) {
			eventSource.fireEvent('bundle-selected', me, function () {
				fulfill();
			});
		});
	},

	//for now content bundles shouldn't show the assignment tab
	shouldShowAssignments: function () {
		return false;
	},

	getPublicScope: function () {
		return this.getScope('public');
	},
	getRestrictedScope: function () {
		return this.getScope('restricted');
	},

	//i don't think this is used

	getScope: function (scope) {
		var s = (this.get('Scopes') || {})[scope] || '';
		if (typeof s === 'string') {
			s = s.split(' ');
		}
		return s.filter(function (v) {
			return !Ext.isEmpty(v);
		});
	},

	hasForumList: function () {
		return !!this.getLink('DiscussionBoard');
	},

	/**
	 * See getForumList in CourseInstance for more details
	 * @returns {Object} a forum list of the contents of this board
	 */
	getForumList: function () {
		var me = this,
			b;

		return me
			.resolveBoard()
			.then(function (board) {
				var contents = board.getLink('contents');

				b = board;

				return Service.request(contents);
			})
			.then(function (json) {
				json = JSON.parse(json);
				json.Items = lazy.ParseUtils.parseItems(json.Items);

				var store = ForumsBoard.buildContentsStoreFromData(
					me.getId() + '-board',
					json.Items
				);

				return [
					{
						title: '',
						store: store,
						board: b,
					},
				];
			});
	},

	resolveBoard: function () {
		var me = this,
			link = me.getLink('DiscussionBoard'),
			//get the cached request, or make a new one.
			p =
				me.__BoardResolver ||
				(
					(link && Service.request(link)) ||
					Promise.reject('No Discussion Board Link')
				)
					//parse
					.then(lazy.ParseUtils.parseItems.bind(lazy.ParseUtils))
					//unwrap from the array
					.then(function (items) {
						if (items.length > 1) {
							console.warn('Too many items found.');
						}
						return items[0];
					})
					//if we fail, delete the cached promise, and resume failure. :P
					.catch(function (reason) {
						delete me.__BoardResolver;
						return Promise.reject(reason);
					});

		//cache the current request
		this.__BoardResolver = p;

		return p;
	},

	represents: function (/*catalogEntry*/) {
		return false;
	},

	getVideosByContentPackage: function () {
		var contentPackages = this.get('ContentPackages'),
			videoMap = {};

		return Promise.all(
			contentPackages.map(function (contentPackage) {
				return contentPackage.getVideos().then(function (videos) {
					videoMap[contentPackage.get('NTIID')] = videos;
				});
			})
		).then(function () {
			return videoMap;
		});
	},
});
