Ext.define('NextThought.common.components.BoundCollection', {
	extend: 'Ext.container.Container',

	emptyText: '',

	layout: 'none',
	items: [],

	getBodyContainer: function() {
		return this;
	},


	parseCollection: function(response) {
		var obj = ParseUtils.parseItems(response)[0];

		return obj || JSON.parse(response);
	},


	loadCollection: function(url) {
		var me = this;

		me.activeUrl = url;

		return Service.request(url)
			.then(me.parseCollection.bind(me))
			.then(function(json) {
				me.setCollection(json);
			})
			.fail(function(reason) {
				console.error('Failed to load outline contents: ', reason);
				//TODO: Show an error state
			});
	},


	getEmptyState: function() {
		return {
			xtype: 'box',
			autoEl: {
				cls: 'empty-state',
				html: this.emptyText
			}
		};
	},


	getItems: function(collection) {
		return collection.get('Items') || [];
	},


	suspendUpdates: function() {
		this.__suspendUpdates = true;
	},


	resumeUpdates: function() {
		this.__suspendUpdates = false;

		if (this.__latestUpdate) {
			this.setCollection(this.__latestUpdate);
			delete this.__latestUpdate;
		}
	},


	onCollectionUpdate: function(collection) {
		if (this.__suspendUpdates) {
			this.__latestUpdate = collection;
		} else {
			this.setCollection(collection);
		}
	},


	setCollection: function(collection) {
		var me = this,
			body = me.getBodyContainer(),
			items = me.getItems(collection),
			cmps = [];

		if (me.updateMonitor) {
			Ext.destroy(me.updateMonitor);
		}

		me.mon(collection, {
			single: true,
			destroyable: true,
			'update': this.onCollectionUpdate.bind(this, collection)
		});

		if (items.length) {
			cmps = items.reduce(function(acc, item) {
				var cmp = item && me.getCmpForRecord(item);

				if (cmp) {
					acc.push(cmp);
				}

				return acc;
			}, []);
		} else if (me.emptyText) {
			cmps.push(me.getEmptyState());
		}

		body.add(cmps);
	},


	getCmpForRecord: function(record) {

	},


	clearCollection: function() {
		var body = this.getBodyContainer();

		body.removeAll(true);
	},


	refresh: function() {
		this.clearCollection();

		return this.loadCollection(this.activeUrl);
	}
});
