const Ext = require('extjs');

const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const {wait} = require('legacy/util/Promise');

require('legacy/model/Base');
require('legacy/mixins/PresentationResources');
require('legacy/mixins/DurationCache');


module.exports = exports = Ext.define('NextThought.model.ContentPackage', {
	extend: 'NextThought.model.Base',

	inheritableStatics: {
		TOC_REQUESTS: {}
	},

	mixins: {
		'PresentationResources': 'NextThought.mixins.PresentationResources',
		'DurationCache': 'NextThought.mixins.DurationCache'
	},

	VIDEO_INDEX_TYPE: 'application/vnd.nextthought.videoindex',
	idProperty: 'index',

	isContentPackage: true,

	fields: [
		{ name: 'Archive Last Modified', type: 'date', dateFormat: 'timestamp' },
		{ name: 'archive', type: 'string' },
		{ name: 'index', type: 'string' },
		{ name: 'index_jsonp', type: 'string' },
		{ name: 'installable', type: 'bool' },
		{ name: 'root', type: 'string' },
		{ name: 'title', type: 'string' },
		{ name: 'description', type: 'string'},
		{ name: 'author', type: 'DCCreatorToAuthor', mapping: 'DCCreator', defaultValue: ['Author Name Here']},
		{ name: 'version', type: 'string'},
		{ name: 'PlatformPresentationResources', type: 'auto'},
		{ name: 'PresentationProperties', type: 'auto'},
		{ name: 'path', type: 'string', defaultValue: ''},
		{ name: 'sample', type: 'bool', defaultValue: false, persist: false},
			//for filtering
		{ name: 'isCourse', type: 'bool', defaultValue: false, persist: false},

		{ name: 'toc', type: 'auto', persist: false},
		{ name: 'icon', type: 'string' },
		{ name: 'thumb', type: 'string' }
	],

	constructor: function () {
		this.callParent(arguments);

		wait()
			//pre resolve which image assets to use
			.then(this.__setImage.bind(this));

		this.LibraryActions = NextThought.app.library.Actions.create();
	},

	getTitle: function () {
		return this.get('title');
	},

	getIcon: function () {
		return this.get('icon');
	},


	update (targetBundle) {
		const link = Service.getObjectURL(this.get('NTIID') || this.get('OID'));

		return Service.getObjectRaw(link, this.get('MimeType'), true, targetBundle)
			.then((response) => {
				return this.syncWithResponse(response.responseText);
			});
	},


	shouldAllowTocLoad () {
		return true;
	},


	getToc: function (status) {
		var me = this,
			library = me.LibraryActions,
			index = me.get('index');

		if (me.self.TOC_REQUESTS[index + '-' + status]) {
			me.tocPromise = me.self.TOC_REQUESTS[index + '-' + status];
		} else {
			me.tocPromise = new Promise ((fulfill, reject) => {
				if (this.shouldAllowTocLoad()) {
					fulfill();
				} else {
					reject();
				}
			})
				.then(() => Service.request(Globals.getURL(index)))
				//parse the response into a xml
				.then(library.parseXML.bind(library))
				//set my root, icon, and title on the doc
				.then(function (xml) {
					var doc = xml.documentElement;

					doc.setAttribute('base', me.get('root'));
					doc.setAttribute('icon', me.get('icon'));
					doc.setAttribute('title', me.get('title'));

					return xml;
				})
				.catch((reason) => {
					delete me.self.TOC_REQUESTS[index + '-' + status];

					return Promise.reject(reason);
				});

			me.self.TOC_REQUESTS[index + '-' + status] = me.tocPromise;
		}

		me.tocPromise
			.then(function (xml) {
				var doc = xml.documentElement;

				//make sure I am synced with the toc
				me.set({
					toc: xml,
					NTIID: doc.getAttribute('ntiid'),
					isCourse: doc.getAttribute('isCourse') === 'true'
				});
			});


		return me.tocPromise;
	},

	asUIData: function () {
		return {
			id: this.getId(),
			isCourse: this.get('isCourse'),
			title: this.get('title'),
			label: this.get('author'),
			icon: this.get('icon'),
			thumb: this.get('thumb')
		};
	},

	fireNavigationEvent: function (eventSource) {
		var id = this.get('NTIID');
		return new Promise(function (fulfill, reject) {
			var txn = window.history.beginTransaction('book-navigation-transaction-' + Globals.guidGenerator());
			eventSource.fireEvent('set-last-location-or-root', id, function (ntiid, reader, error) {
				if (error) {
					txn.abort();
					reject(error);
				}
				else {

					fulfill();
					txn.commit();
				}
			});
		});
	},

	getDefaultAssetRoot: function () {
		var root = this.get('root');

		if (!root) {
			console.error('No root for content package: ', this);
			return '';
		}

		return Globals.getURL(root).concatPath('/presentation-assets/webapp/v1/');
	},

	__cacheContentPreferences: function () {
		var c = console;
		Service.getPageInfo(this.get('NTIID'))
				.then(undefined, c.error.bind(c));
	},

	__setImage: function () {
		var me = this;
		me.getImgAsset('landing').then(function (url) { me.set('icon', url); });
		me.getImgAsset('thumb').then(function (url) { me.set('thumb', url); });
	},

	represents: function () {return false;},

	getReferenceSelector: function (type) {
		type = ParseUtils.escapeId(type);

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

					return ParseUtils.parseItems(item)[0];
				});
			})
			.catch(function (reason) {
				console.error('Failed to get videos: ', reason);

				return [];
			});
	}
});
