Ext.define('NextThought.common.components.BoundCollection', {
	extend: 'Ext.container.Container',

	emptyText: '',
	transitionStates: false,

	layout: 'none',
	items: [],


	initComponent: function() {
		this.callParent(arguments);

		this.addBodyConfig();
	},


	addBodyConfig: function() {
		this.add(this.getBodyConfig());
	},


	getBodyConfig: function() {
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


	getBodyContainer: function() {
		return this.down('[isCollectionBody]');
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


	beforeSetCollection: function() {},
	afterSetCollection: function() {},


	onCollectionUpdate: function(collection) {
		if (this.__suspendUpdates) {
			this.__latestUpdate = collection;
		} else {
			this.setCollection(collection);
		}
	},


	setHeaderForCollection: function(collection) {
		var header = this.buildHeader && this.buildHeader(collection);

		if (this.currentHeader) {
			this.currentHeader.destroy();
		}

		if (header) {
			this.currentHeader = this.insert(0, header);
		}
	},


	setFooterForCollection: function(collection) {
		var footer = this.buildFooter && this.buildFooter(collection);

		if (this.currentFooter) {
			this.currentFooter.destroy();
		}

		if (footer) {
			this.currentFooter = this.insert(2, footer);
		}
	},


	setCollection: function(collection) {
		this.beforeSetCollection(collection);

		var items = this.getItems(collection);

		this.setHeaderForCollection(collection);
		this.setFooterForCollection(collection);

		if (this.updateMonitor) {
			Ext.destroy(this.updateMonitor);
		}

		this.updateMonitor = this.mon(collection, {
			single: true,
			destroyable: true,
			'update': this.onCollectionUpdate.bind(this, collection)
		});

		if (this.__activeState && this.transitionStates) {
			this.__transitionTo(items);
		} else {
			this.__showItems(items);
		}

		this.afterSetCollection(collection);
	},


	__transitionTo: function(items) {},


	__showItems: function(items) {
		var me = this, state,
			body = me.getBodyContainer();

		this.clearCollection();

		state = items.reduce(function(acc, item) {
			var cmp = item && me.getCmpForRecord(item);

			if (cmp) {
				acc.cmps.push(cmp);
				acc.items.push(item);
				acc.map[item.getId()] = cmp;
			}

			return acc;
		}, {cmps: [], items: [], map: {}});

		if (!state.cmps.length && this.emptyText) {
			state.cmps.push(me.getEmptyState());
		}

		this.__activeState = state;

		body.add(state.cmps);
	},


	getCmpForRecord: function(record, transition) {

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
