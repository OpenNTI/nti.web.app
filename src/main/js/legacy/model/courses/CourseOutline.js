var Ext = require('extjs');
var ContentUtils = require('../../util/Content');
var ParseUtils = require('../../util/Parsing');
var ModelBase = require('../Base');
var MixinsDurationCache = require('../../mixins/DurationCache');
var MixinsMovingRoot = require('../../mixins/MovingRoot');
var OrderedContents = require('../../mixins/OrderedContents');
var CoursewareOutlineInterface = require('../../store/courseware/OutlineInterface');
var NavigationCourseOutlineNode = require('./navigation/CourseOutlineNode');
var NavigationCourseOutlineContentNode = require('./navigation/CourseOutlineContentNode');
var NavigationCourseOutlineCalendarNode = require('./navigation/CourseOutlineCalendarNode');
var Url = require('url');


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
			NextThought.model.courses.navigation.CourseOutlineNode.mimeType
		];
	},


	__loadContents: function (link, key, doNotCache, outline) {
		var me = this,
			load;

		load = me.getFromCache(key);

		if (!load || doNotCache) {
			load = Service.request(link)
				.then(function (text) { return Ext.decode(text); })
				.then(function (json) { return ParseUtils.parseItems(json); })
				.then(function (items) {
					//create a clone of this model
					this[outline] = this[outline] || me.self.create(me.getData());

					this[outline].set('Items', items);
					this[outline].fillInItems();

					if (me.bundle) {
						this[outline].setBundle(me.bundle);
					}

					return this[outline];
				});

			me.cacheForShortPeriod(key, load);
		}

		return load;
	},

	getOutlineContents: function (doNotCache) {
		var link = this.getLink('contents');

		return this.__loadContents(link, 'LoadContents', doNotCache, 'OutlineContents');
	},

	getAdminOutlineContents: function (doNotCache) {
		var link = this.getLink('contents'),
			parts = Url.parse(link),
			query = Ext.Object.fromQueryString(parts.search);

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
				.then(function (me) { return me.getNode(id); })
				.then(function (node) {
					if (!node) {
						throw 'Not found';
					}
					return node;//probably not needed
				});
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
