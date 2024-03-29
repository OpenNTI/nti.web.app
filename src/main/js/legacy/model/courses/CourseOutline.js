const Ext = require('@nti/extjs');
const ContentUtils = require('internal/legacy/util/Content');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const OutlineInterface = require('internal/legacy/store/courseware/OutlineInterface');

const CourseOutlineNode = require('./navigation/CourseOutlineNode');

require('internal/legacy/mixins/DurationCache');
require('internal/legacy/mixins/MovingRoot');
require('internal/legacy/mixins/OrderedContents');
require('./navigation/CourseOutlineContentNode');
require('./navigation/CourseOutlineCalendarNode');
require('../Base');

module.exports = exports = Ext.define(
	'NextThought.model.courses.CourseOutline',
	{
		extend: 'NextThought.model.Base',
		mimeType: 'application/vnd.nextthought.courses.courseoutline',

		mixins: {
			DurationCache: 'NextThought.mixins.DurationCache',
			MovingRoot: 'NextThought.mixins.MovingRoot',
			OrderedContents: 'NextThought.mixins.OrderedContents',
		},

		fields: [
			{
				name: 'CourseOutlineSharedEntries',
				type: 'auto',
				persist: false,
			},
			{ name: 'Items', type: 'arrayItem', persist: false },
			{ name: 'IsCourseOutlineShared', type: 'bool', persist: false },
			{ name: 'ContentsLastModified', type: 'date', persist: false },
			{ name: 'ContentsHash', type: 'auto', persist: false },
		],

		constructor() {
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
			return [CourseOutlineNode.mimeType];
		},

		__syncItems(itemsToSync, cache) {
			if (!this[cache]) {
				this[cache] = {};
			}

			const mapItems = items => {
				return items.map(item => {
					const id = item.getId();
					let cachedItem = this[cache][id];

					if (!cachedItem) {
						this[cache][id] = item;
						cachedItem = item;
					} else if (
						cachedItem.get('Last Modified') <=
						item.get('Last Modified')
					) {
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
				load = Service.request({ url: link, returnResponse: true })
					.then(resp => {
						this.set(
							'ContentsLastModified',
							resp.getResponseHeader('Last-Modified')
						);
						this.set(
							'ContentsHash',
							resp.getResponseHeader('etag')
						);

						return Ext.decode(resp.responseText);
					})
					.then(json => lazy.ParseUtils.parseItems(json))
					.then(items => {
						//create a clone of this model
						this[outline] =
							this[outline] || this.self.create(this.getData());

						this[outline].set(
							'ContentsLastModified',
							this.get('ContentsLastModified')
						);
						this[outline].set(
							'ContentsHash',
							this.get('ContentsHash')
						);

						this[outline].set(
							'Items',
							this.__syncItems(items, `${outline}-cache`)
						);
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

		getOutlineContents: async function (doNotCache) {
			var link = this.getLink('contents');

			if (!link) {
				throw new Error('No Link');
			}

			return this.__loadContents(
				link,
				'LoadContents',
				doNotCache,
				'OutlineContents'
			);
		},

		getAdminOutlineContents: async function (doNotCache) {
			var link = this.getLink('contents'),
				parts = new URL(link, global.location.origin),
				query = Ext.Object.fromQueryString(parts.search);

			if (!link) {
				throw new Error('No Link');
			}

			delete query['omit_unpublished'];

			parts.search = '?' + Ext.Object.toQueryString(query);
			link = parts.toString();

			return this.__loadContents(
				link,
				'AdminLoadContents',
				doNotCache,
				'AdminOutlineContents'
			);
		},

		hasSharedEntries: function () {
			return this.get('IsCourseOutlineShared');
		},

		findOutlineNode: function (id) {
			return this.getOutlineContents().then(function (outline) {
				var items = outline.get('Items'),
					node = (items || []).reduce(function (acc, o) {
						return acc || (o.findNode && o.findNode(id));
					}, null);

				return node;
			});
		},

		getContents: function () {
			var me = this,
				l;

			if (!me.__promiseToLoadContents) {
				l = me.getLink('contents');

				console.time('Requesting Course Outline: ' + l);
				me.__promiseToLoadContents = Service.request(l)
					.then(function (text) {
						return Ext.decode(text);
					})
					.then(function (json) {
						return lazy.ParseUtils.parseItems(json);
					})
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
			var legacy,
				node = (this.get('Items') || []).reduce(function (n, o) {
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

			return ContentUtils.getLineage(ntiid, me.bundle).then(function (
				lineages
			) {
				var lineage = lineages[0],
					i,
					rec;

				for (i = 0; i < lineage.length; i++) {
					rec = me.getNode(lineage[i]);

					if (rec && rec.get('AvailableBeginning') < new Date()) {
						return true;
					}
				}

				return false;
			});
		},

		async updateHeaders() {
			try {
				const resp = await Service.request({
					url: this.get('href'),
					method: 'HEAD',
				});

				this.set(
					'ContentsLastModified',
					resp.getResponseHeader('Last-Modified')
				);
				this.set('ContentsHash', resp.getResponseHeader('etag'));
				this.fireEvent('update');
			} catch (e) {
				//swallow
			}
		},

		onItemUpdated: function () {
			OutlineInterface.fillInDepths(this);
			this.updateHeaders();
		},

		onItemAdded: function () {
			OutlineInterface.fillInDepths(this);
			this.updateHeaders();
		},

		onItemRemoved() {
			this.updateHeaders();
		},

		onSync: function () {
			OutlineInterface.fillInDepths(this);
			this.fillInItems();
		},
	}
);
