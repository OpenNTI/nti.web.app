var Ext = require('extjs');
var ParseUtils = require('../../util/Parsing');


module.exports = exports = Ext.define('NextThought.common.components.BoundPanel', {
	extend: 'Ext.container.Container',
	alias: 'widget.data-bound-panel',

	overflowX: 'hidden',
	overflowY: 'auto',
	cls: 'scrollable',

	initComponent: function() {
		this.callParent(arguments);
		this.store = this.store || Ext.getStore(this.storeId || '');
		if (this.store) {
			this.bindStore(this.store);
		}
	},

	bindStore: function (store) {
		if (!store) { return; }

		this.store = store;
		this.mon(this.store, {
			scope: this,
			load: 'onBoundStoreLoad',
			clear: 'removeAllItems',
			'parent-store-loaded': 'onParentStoreLoad',
			add: 'onBoundStoreAdd',
			remove: 'onBoundStoreRemove',
			refresh: 'doRefresh'
		});

		if (this.rendered) {
			this.doRefresh(store);
		}
	},


	getComponentConfigForRecord: function(rec) {
		var id = rec.getId();
		if (rec.hidden || (this.filter && !this.filter(rec))) {
			return null;
		}

		return {record: rec, recordId: id && ParseUtils.escapeId(id)};
	},


	showEmptyState: function() {
		if (this.emptyCmp && !this.emptyState) {
			this.add(this.emptyCmp);
			this.emptyState = true;
			this.addCls('empty');
			this.removeCls('scrollable');
		}
	},


	hideEmptyState: function() {
		if (this.down('[emptyState=true]')) {
			this.down('[emptyState=true]').destroy();
		}
		this.emptyState = false;
		if (!this.isDestroyed) {
			try {
				this.removeCls('empty');
				this.addCls('scrollable');
			} catch (e) {
				console.error(e.stack || e.message || e);
			}
		}
	},


	shouldHide: function(records) {
		var allHidden = true, me = this;
		Ext.each(records, function(item) {
			allHidden = allHidden && !!(item.hidden || (me.filter && !me.filter(item)));
		});

		return allHidden;
	},


	onParentStoreLoad: function(store, records) {
		var total = 0;

		Ext.each(records, function(item) {
			if (item.get('ID').indexOf('mycontacts') === 0) {
				total += item.getFriendCount();
			}
		});

		if (total === 0) {
			this.showEmptyState();
		}
	},


	doRefresh: function(store) {
		clearTimeout(this.refreshTask);
		this.refreshTask = Ext.defer(this.onBoundStoreLoad, 100, this, [store]);
	},


	onBoundStoreLoad: function(store) {
		var items;

		this.removeAll(true);
		if (this.initialConfig.items) {
			this.add(this.initialConfig.items);
		}

		items = store.snapshot ? store.snapshot.items : store.data.items;
		if (store.snapshot) {
			items = items.slice();
			items.sort(store.generateComparator());
		}

		this.hideEmptyState();

		if (this.shouldHide(items) || Ext.isEmpty(items)) {
			this.showEmptyState();
		} else {
			this.onBoundStoreAdd(store, items);
		}
	},


	onBoundStoreAdd: function(store, records, index) {

		var insertionPoint = this.defaultInsertPoint || index || 0,//force number
			toAdd;

		records.sort(store.generateComparator());
		toAdd = Ext.Array.clean(Ext.Array.map(records, this.getComponentConfigForRecord, this));

		if (!this.shouldHide(records)) {
			this.hideEmptyState();
		}

		this.insertItem(insertionPoint, toAdd);
	},


	onBoundStoreRemove: function(store, record) {
		console.debug('remove', arguments);

		var me = this;

		function itr(i) {
			if (i.recordId === ParseUtils.escapeId(record.getId())) {
				me.removeItem(i, true);
				return false;
			}
			return true;
		}

		this.items.each(itr, this);

		if (this.shouldHide(store.getRange())) {
			this.showEmptyState();
		}
	},


	removeAllItems: function() {
		this.removeAll(true);
	},


	insertItem: function(insertAt, toInsert) {
		return this.insert(insertAt, toInsert);
	},


	removeItem: function(o, autoDestroy) {
		return this.remove(o, autoDestroy);
	}
});
