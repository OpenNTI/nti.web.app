Ext.define('NextThought.view.forums.hierarchy.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.forums-hierachy-view',

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	noScrollBuffer: true,

	// navigation: { xtype: 'forums-hierarchy-nav' },
	// body: { xtype: 'forums-hierarchy-body'},

	storeCfg: {},


	afterRender: function() {
		this.callParent(arguments);
		if (this.record) {
			this.setCurrent(this.record);
		}

		if (this.navigation) {
			this.mon(this.navigation, {
				'update-body': 'setCurrentBody',
				'beforeselect': 'maybeStopSelectionChange',
				'beforeitemclick': 'maybeStopSelectionChange'
			});

			this.relayEvents(this.navigation, ['pop-view']);
		}

		if (this.body) {
			this.mon(this.body, {
				'goto-index': 'setCurrentIndex',
				'goto-record': 'setCurrentBody',
				'new-record': 'newRecordAdded',
				'record-deleted': 'recordDeleted'
			});

			this.relayEvents(this.body, ['pop-view', 'new-record']);
		}
	},

	//if the body is in a state where it shouldn't allow a selection change
	//return false to prevent the navigation bar from getting out of sink
	maybeStopSelectionChange: function() {
		if (this.body && !this.body.allowSelectionChange()) {
			return false;
		}
	},


	getCurrent: function() {
		return this.currentRecord;
	},


	setCurrent: function(record) {
		var store = record.buildContentsStore('', this.storeCfg);

		this.currentRecord = record;
		this.store = store;

		this.mon(this.store, {
			scope: this,
			single: true,
			load: 'setCurrentBody'
		});

		//if (this.currentRecord.activeRecord) {
		//	this.store.proxy.extraParams = Ext.apply(this.store.proxy.extraParams || {}, {batchAround: this.currentRecord.activeRecord.get('OID')});
		//}

		this.store.load();

		this.navigation.setCurrent(record, store);
	},


	setCurrentBody: function(record) {
		var cfg = {};

		if (!record || !record.isModel) {
			if (this.currentRecord.activeRecord) {
				record = this.currentRecord.activeRecord;
			} else if (this.currentRecord.activeNTIID) {
				record = this.store.getById(this.currentRecord.activeNTIID);
			} else {
				record = this.store.getAt(0);
			}
		}

		//delete this.store.proxy.extraParams.batchAround;

		cfg.currentIndex = this.store.indexOf(record);
		cfg.total = this.store.getTotalCount();

		//if there is an index lower than us
		if (cfg.currentIndex > 0) {
			cfg.previousIndex = cfg.currentIndex - 1;
		}

		//if there is an index higher than us
		if (cfg.currentIndex < this.store.getCount() - 1) {
			cfg.nextIndex = cfg.currentIndex + 1;
		}

		//setCurrent returns true if it updated the active record, false otherwise
		if (this.body.setCurrent(record, this.currentRecord, cfg)) {
			this.navigation.setActiveRecord(record);
			this.fireEvent('active-record-changed', record);
		}
	},


	setCurrentIndex: function(index) {
		var record = this.store.getAt(index);

		this.setCurrentBody(record);
		this.navigation.setActiveRecord(record);
	},


	recordDeleted: function() {},


	newRecordAdded: function() {}
});
