const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const LibraryActions = require('internal/legacy/app/library/Actions');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);

require('internal/legacy/model/Base');
require('internal/legacy/mixins/PresentationResources');
require('internal/legacy/mixins/DurationCache');

module.exports = exports = Ext.define('NextThought.model.ContentPackage', {
	extend: 'NextThought.model.Base',

	inheritableStatics: {
		TOC_REQUESTS: {},
	},

	mixins: {
		PresentationResources: 'NextThought.mixins.PresentationResources',
		DurationCache: 'NextThought.mixins.DurationCache',
	},

	VIDEO_INDEX_TYPE: 'application/vnd.nextthought.videoindex',
	idProperty: 'index',

	isContentPackage: true,

	fields: [
		{
			name: 'Archive Last Modified',
			type: 'date',
			dateFormat: 'timestamp',
		},
		{ name: 'archive', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'index_jsonp', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'description', type: 'string' },
		{
			name: 'author',
			type: 'DCCreatorToAuthor',
			mapping: 'DCCreator',
			defaultValue: ['Author Name Here'],
		},
		{ name: 'version', type: 'string' },
		{ name: 'PlatformPresentationResources', type: 'auto' },
		{ name: 'PresentationProperties', type: 'auto' },
		{ name: 'path', type: 'string', defaultValue: '' },
		{ name: 'sample', type: 'bool', defaultValue: false, persist: false },
		//for filtering
		{ name: 'isCourse', type: 'bool', defaultValue: false, persist: false },

		{ name: 'toc', type: 'auto', persist: false },
		{ name: 'icon', type: 'string' },
		{ name: 'thumb', type: 'string' },
	],

	constructor: function () {
		this.callParent(arguments);

		wait()
			//pre resolve which image assets to use
			.then(this.__setImage.bind(this));

		this.LibraryActions = LibraryActions.create();
	},

	getTitle: function () {
		return this.get('title');
	},

	getIcon: function () {
		return this.get('icon');
	},

	update(targetBundle) {
		const link = Service.getObjectURL(this.get('NTIID') || this.get('OID'));

		return Service.getObjectRaw(
			link,
			this.get('MimeType'),
			true,
			targetBundle
		).then(response => {
			return this.syncWithResponse(response.responseText);
		});
	},

	shouldAllowTocLoad() {
		return true;
	},

	async getToc(status) {
		const library = this.LibraryActions;
		const index = this.get('index');
		const REQUESTS = this.self.TOC_REQUESTS;
		const key = index + '-' + status;

		this.tocPromise =
			REQUESTS[key] ||
			(REQUESTS[key] = (async () => {
				try {
					if (!this.shouldAllowTocLoad()) {
						return null;
					}

					const data = await Service.request(Globals.getURL(index));
					//parse the response into a xml
					const xml = await library.parseXML(data);
					//set my root, icon, and title on the doc

					const doc = xml.documentElement;

					doc.setAttribute('base', this.get('root'));
					doc.setAttribute('icon', this.get('icon'));
					doc.setAttribute('title', this.get('title'));

					return xml;
				} catch (reason) {
					delete this.self.TOC_REQUESTS[key];

					throw reason;
				}
			})());

		const xml = await this.tocPromise;

		if (xml) {
			const doc = xml.documentElement;

			//make sure I am synced with the toc
			this.set({
				toc: xml,
				NTIID: doc.getAttribute('ntiid'),
				isCourse: doc.getAttribute('isCourse') === 'true',
			});
		}

		return xml;
	},

	asUIData: function () {
		return {
			id: this.getId(),
			isCourse: this.get('isCourse'),
			title: this.get('title'),
			label: this.get('author'),
			icon: this.get('icon'),
			thumb: this.get('thumb'),
		};
	},

	fireNavigationEvent: function (eventSource) {
		var id = this.get('NTIID');
		return new Promise(function (fulfill, reject) {
			var txn = window.history.beginTransaction(
				'book-navigation-transaction-' + Globals.guidGenerator()
			);
			eventSource.fireEvent(
				'set-last-location-or-root',
				id,
				function (ntiid, reader, error) {
					if (error) {
						txn.abort();
						reject(error);
					} else {
						fulfill();
						txn.commit();
					}
				}
			);
		});
	},

	getDefaultAssetRoot: function () {
		var root = this.get('root');

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return Globals.getURL(root).concatPath(
			'/presentation-assets/webapp/v1/'
		);
	},

	__cacheContentPreferences: function () {
		var c = console;
		Service.getPageInfo(this.get('NTIID')).then(undefined, c.error.bind(c));
	},

	__setImage: function () {
		var me = this;
		me.getImgAsset('landing').then(function (url) {
			me.set('icon', url);
		});
		me.getImgAsset('thumb').then(function (url) {
			me.set('thumb', url);
		});
	},

	represents: function () {
		return false;
	},

	getReferenceSelector: function (type) {
		type = lazy.ParseUtils.escapeId(type);

		return 'reference[type="' + type + '"]';
	},

	getReference: function (type) {
		var selector = this.getReferenceSelector(type),
			root = this.get('root'),
			key = 'reference-' + type,
			load;

		load = this.getFromCache(key);

		if (!load) {
			load = this.getToc()
				.then(function (toc) {
					var reference = toc.querySelector(selector);
					var link = reference && reference.getAttribute('href');

					if (!link) {
						return Promise.reject('No link');
					}

					link = Globals.getURL(link, root || '');

					return Service.request(link);
				})
				.then(function (response) {
					var json = Globals.parseJSON(response, true);

					return json || response;
				});

			this.cacheForever(key, load);
		}

		return load;
	},

	getVideos: function () {
		return this.getReference(this.VIDEO_INDEX_TYPE)
			.then(function (videoIndex) {
				var items = videoIndex.Items,
					keys = Object.keys(items);

				return keys.map(function (key) {
					var item = items[key];

					return lazy.ParseUtils.parseItems(item)[0];
				});
			})
			.catch(function (reason) {
				console.error('Failed to get videos: ', reason);

				return [];
			});
	},
});
