var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');
var MixinsTransition = require('../../mixins/Transition');


module.exports = exports = Ext.define('NextThought.common.components.BoundCollection', {
	extend: 'Ext.container.Container',
	emptyText: '',
	transitionStates: false,
	autoUpdate: true,
	layout: 'none',
	items: [],

	initComponent: function () {
		this.callParent(arguments);

		this.addBodyConfig();

		if (this.initialState) {
			this.__activeState = {items: this.getItems(this.initialState)};
		}
	},

	addBodyConfig: function () {
		this.add(this.getBodyConfig());
	},

	getBodyConfig: function () {
		var cls = ['collection-body'];

		if (this.bodyCls) {
			cls.push(this.bodyCls);
		}

		return {
			xtype: 'container',
			cls: cls.join(' '),
			isCollectionBody: true,
			layout: 'none',
			items: []
		};
	},

	getBodyContainer: function () {
		return this.down('[isCollectionBody]');
	},

	getComponents: function () {
		var body = this.getBodyContainer(),
			items = body && body.items && body.items.items;

		return items || [];
	},

	parseCollection: function (response) {
		var obj = ParseUtils.parseItems(response)[0];

		return obj || JSON.parse(response);
	},

	loadCollection: function (url) {
		var me = this;

		me.activeUrl = url;

		return Service.request(url)
			.then(me.parseCollection.bind(me))
			.then(function (json) {
				me.setCollection(json);
			})
			.catch(function (reason) {
				console.error('Failed to load outline contents: ', reason);
				//TODO: Show an error state
			});
	},

	getEmptyState: function () {
		return {
			xtype: 'box',
			autoEl: {
				cls: 'empty-state',
				html: this.emptyText
			}
		};
	},

	getItems: function (collection) {
		return collection.get('Items') || [];
	},

	suspendUpdates: function () {
		this.__suspendUpdates = true;
	},

	resumeUpdates: function () {
		this.__suspendUpdates = false;

		if (this.__latestUpdate) {
			this.setCollection(this.__latestUpdate);
			delete this.__latestUpdate;
		}
	},

	beforeSetCollection: function () {},
	afterSetCollection: function () {},

	onCollectionUpdate: function (collection) {
		if (this.__suspendUpdates) {
			this.__latestUpdate = collection;
		} else {
			this.setCollection(collection);
		}
	},

	setHeaderForCollection: function (collection) {
		var header = this.buildHeader && this.buildHeader(collection);

		if (this.currentHeader) {
			this.currentHeader.destroy();
		}

		if (header) {
			this.currentHeader = this.insert(0, header);
		}
	},

	setFooterForCollection: function (collection) {
		var footer = this.buildFooter && this.buildFooter(collection);

		if (this.currentFooter) {
			this.currentFooter.destroy();
		}

		if (footer) {
			this.currentFooter = this.insert(2, footer);
		}
	},

	setCollection: function (collection) {
		this.beforeSetCollection(collection);

		var items = this.getItems(collection);

		this.setHeaderForCollection(collection);
		this.setFooterForCollection(collection);

		if (this.updateMonitor) {
			Ext.destroy(this.updateMonitor);
		}

		if (this.autoUpdate) {
			this.updateMonitor = this.mon(collection, {
				single: true,
				destroyable: true,
				'update': this.onCollectionUpdate.bind(this, collection)
			});
		}

		if (this.__activeState && this.transitionStates) {
			this.__activeState = this.__transitionTo(items, this.__activeState);
		} else {
			this.__activeState = this.__showItems(items);
		}

		this.afterSetCollection(collection);
	},

	mergeItems: function (oldItems, newItems) {
		var oldIndex = 0, newIndex = 0,
			oldRecords, newRecords,
			newItem, oldItem,
			merge = [];

		oldRecords = oldItems.reduce(function (acc, item) {
			acc[item.getId()] = true;
			return acc;
		}, {});


		newRecords = newItems.reduce(function (acc, item) {
			acc[item.getId()] = true;
			return acc;
		}, {});

		/*
		 * Merge with the following heuristic:
		 *
		 * Iterating the new list, look at whats at the same index in the old list.
		 * Then:
		 *
		 * 1.) If both lists have the same record, add it to the merged list with no transition
		 * 2.) If both lists have different records
		 *	a.) If the new is not in the old list, add it to the merged list with an add transition
		 *	b.) If the new is in the old list, add it to the merged list with a move transition
		 *	c.) If the old is not in the new list, add it to the merged list with a remove transition
		 *	d.) If the old is in the new list, do nothing (Hitting it in the new list will make sure its there)
		 *
		 * Then if there is anything left in the old list, append them with a remove transition
		 */

		 while (oldItems[oldIndex] || newItems[newIndex]) {
			newItem = newItems[newIndex];
			oldItem = oldItems[oldIndex];

			if (!newItem && oldItem) {
				merge.push({record: oldItem, type: NextThought.mixins.Transition.LIST_REMOVE, oldRecord: oldItem});
			} else if (newItem && !oldItem) {
				merge.push({record: newItem, type: NextThought.mixins.Transition.LIST_ADD, oldRecord: oldItem});
			} else if (newItem.getId() === oldItem.getId()) {
				merge.push({record: newItem, type: '', oldRecord: oldItem});
			} else {
				if (oldRecords[newItem.getId()]) {
					merge.push({record: newItem, type: NextThought.mixins.Transition.LIST_MOVE, oldRecord: newItem});
				} else {
					merge.push({record: newItem, type: NextThought.mixins.Transition.LIST_ADD, oldRecord: oldItem});
				}

				if (!newRecords[oldItem.getId()]) {
					merge.push({record: oldItem, type: NextThought.mixins.Transition.LIST_REMOVE, oldRecord: oldItem});
				}
			}

			oldIndex += 1;
			newIndex += 1;
		 }

		return merge;
	},

	__transitionTo: function (items, state) {
		var me = this, newState,
			merged = this.mergeItems(state.items, items),
			body = this.getBodyContainer();

		this.clearCollection();

		newState = merged.reduce(function (acc, item) {
			var cmp = item && me.getCmpForRecord(item.record, item.type, item.oldRecord);

			if (cmp) {
				acc.cmps.push(cmp);
				acc.items.push(item.record);
			}

			return acc;
		}, {cmps: [], items: []});

		if (!newState.cmps.length && this.emptyText) {
			newState.cmps.push(me.getEmptyState());
		}

		body.add(newState.cmps);

		return newState;
	},

	__showItems: function (items) {
		var me = this, state,
			body = me.getBodyContainer();

		this.clearCollection();

		state = items.reduce(function (acc, item) {
			var cmp = item && me.getCmpForRecord(item);

			if (cmp) {
				acc.cmps.push(cmp);
				acc.items.push(item);
			}

			return acc;
		}, {cmps: [], items: []});

		if (!state.cmps.length && this.emptyText) {
			state.cmps.push(me.getEmptyState());
		}

		body.add(state.cmps);

		return state;
	},

	/**
	 * Return a cmp to add to the body for a given record.
	 *
	 * A transition can be given to trigger an animation for adding or removing.
	 *
	 * An earlier version of the record can be passed, so the cmp has a chance
	 * to figure out how it should animate the record in. Since we are creating
	 * new cmps every time and not updating existing cmps, this gives us a chance
	 * to nest the transition between states.
	 *
	 * @param  {Object} record		 the record to get the comp for
	 * @param  {String} transition	 a transition cls to apply to the record
	 * @param  {Object} initialState an earlier version of the record
	 * @return {Object}				 the cmp for the record
	 */
	getCmpForRecord: function (record, transition, initialState) {

	},

	clearCollection: function () {
		var body = this.getBodyContainer();

		body.removeAll(true);
	},

	refresh: function () {
		this.clearCollection();

		return this.loadCollection(this.activeUrl);
	}
});
