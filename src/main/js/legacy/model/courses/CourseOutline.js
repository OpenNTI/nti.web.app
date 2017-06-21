const Url = require('url');

const Ext = require('extjs');

const ContentUtils = require('../../util/Content');
const ParseUtils = require('../../util/Parsing');

const CourseOutlineNode = require('./navigation/CourseOutlineNode');

require('./navigation/CourseOutlineContentNode');
require('./navigation/CourseOutlineCalendarNode');
require('../../store/courseware/OutlineInterface');
require('legacy/mixins/DurationCache');
require('legacy/mixins/MovingRoot');
require('legacy/mixins/OrderedContents');
require('../Base');


module.exports = exports = Ext.define('NextThought.model.courses.CourseOutline', {
	extend: 'NextThought.model.Base',
	mimeType: 'application/vnd.nextthought.courses.courseoutline',

	mixins: {
		DurationCache: 'NextThought.mixins.DurationCache',
		MovingRoot: 'NextThought.mixins.MovingRoot',
		OrderedContents: 'NextThought.mixins.OrderedContents'
	},

	fields: [
		{name: 'CourseOutlineSharedEntries', type: 'auto', persist: false},
		{name: 'Items', type: 'arrayItem', persist: false},
		{name: 'IsCourseOutlineShared', type: 'bool', persist: false}
	],

	constructor () {
		this.callParent(arguments);

		this.fillInItems();
	},

	hasContentsLink: function () {
		return !!this.getLink('contents');
	},

	setBundle: function (bundle) {
		this.bundle = bundle;
	},

	getTitle: function () {
		return this.bundle && this.bundle.getTitle();
	},

	getAllowedTypes: function () {
		return [
			CourseOutlineNode.mimeType
		];
	},


	__syncItems (itemsToSync) {
		if (!this.CACHED_ITEMS) {
			this.CACHED_ITEMS = {};
		}

		const mapItems = (items) => {
			return items.map(item => {
				const id = item.getId();
				let cachedItem = this.CACHED_ITEMS[id];

				if (!cachedItem) {
					this.CACHED_ITEMS[id] = item;
					cachedItem = item;
				} else if (cachedItem.get('Last Modified') <= item.get('Last Modified')) {
					cachedItem.syncWith(item, true);
				}

				const subItems = cachedItem.get('Items');

				if (subItems) {
					cachedItem.set('Items', mapItems(subItems));
				}

				return cachedItem;
			});
		};

		return mapItems(itemsToSync);
	},


	__loadContents: function (link, key, doNotCache, outline) {
		let load = this.getFromCache(key);

		if (!load || doNotCache) {
			load = Service.request(link)
				.then((text) => Ext.decode(text))
				.then((json) => ParseUtils.parseItems(json))
				.then((items) => {
					//create a clone of this model
					this[outline] = this[outline] || this.self.create(this.getData());

					this[outline].set('Items', this.__syncItems(items));
					this[outline].fillInItems();

					if (this.bundle) {
						this[outline].setBundle(this.bundle);
					}

					return this[outline];
				});

			this.cacheForShortPeriod(key, load);
		}

		return load;
	},

	getOutlineContents: function (doNotCache) {
		var link = this.getLink('contents');

		if(!link) {
			return Promise.reject('No Link');
		}

		return this.__loadContents(link, 'LoadContents', doNotCache, 'OutlineContents');
	},

	getAdminOutlineContents: function (doNotCache) {
		var link = this.getLink('contents'),
			parts = Url.parse(link),
			query = Ext.Object.fromQueryString(parts.search);

		if(!link) {
			return Promise.reject('No Link');
		}

		delete query['omit_unpublished'];

		parts.search = '?' + Ext.Object.toQueryString(query);
		link = Url.format(parts);

		return this.__loadContents(link, 'AdminLoadContents', doNotCache, 'AdminOutlineContents');
	},

	hasSharedEntries: function () {
		return this.get('IsCourseOutlineShared');
	},

	findOutlineNode: function (id) {
		return this.getOutlineContents()
			.then(function (outline) {
				var items = outline.get('Items'),
					node = (items || []).reduce(function (acc, o) {
						return acc || (o.findNode && o.findNode(id));
					}, null);

				return node;
			});
	},

	getContents: function () {
		var me = this, l;

		if (!me.__promiseToLoadContents) {

			l = me.getLink('contents');

			console.time('Requesting Course Outline: ' + l);
			me.__promiseToLoadContents = Service.request(l)
					.then(function (text) { return Ext.decode(text); })
					.then(function (json) { return ParseUtils.parseItems(json); })
					.then(function (items) {
						me.set('Items', items);
						console.timeEnd('Requesting Course Outline: ' + l);
						return me;
					});
		}

		return me.__promiseToLoadContents;
	},

	findNode: function (id) {
		if (!this.navStore) {
			return Promise.reject('Navigation store not loaded');
		}

		return this.getContents()
				.then(me => me.getNode(id))
				.then(node => node || Promise.reject('Not found'));
	},

	getNode: function (id) {
		var legacy, node = (this.get('Items') || []).reduce(function (n, o) {
				return n || (o.findNode && o.findNode(id));
			}, null);

		//hack:
		if (node) {
			legacy = this.navStore.getById(id);
			if (legacy) {
				node.set('title', legacy.get('label'));
			}
		}

		return node;
	},

	//TODO: do we need this funtion?
	isVisible: function (ntiid) {
		if (!this.bundle) {
			return Promise.resolve(true);
		}

		var me = this;

		return ContentUtils.getLineage(ntiid, me.bundle)
			.then(function (lineages) {
				var lineage = lineages[0], i, rec;

				for (i = 0; i < lineage.length; i++) {
					rec = me.getNode(lineage[i]);

					if (rec && rec.get('AvailableBeginning') < new Date()) {
						return true;
					}
				}

				return false;
			});
	},

	onItemUpdated: function () {
		NextThought.store.courseware.OutlineInterface.fillInDepths(this);
	},

	onItemAdded: function () {
		NextThought.store.courseware.OutlineInterface.fillInDepths(this);
	},

	onSync: function () {
		NextThought.store.courseware.OutlineInterface.fillInDepths(this);
		this.fillInItems();
	}
});
