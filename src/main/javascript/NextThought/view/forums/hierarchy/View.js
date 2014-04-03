Ext.define('NextThought.view.forums.hierarchy.View', {
	extend: 'NextThought.view.navigation.AbstractPanel',
	alias: 'widget.forums-hierachy-view',

	requires: [
		'NextThought.proxy.PageSource'
	],

	mixins: {
		customScroll: 'NextThought.mixins.CustomScroll'
	},

	noScrollBuffer: true,

	// navigation: { xtype: 'forums-hierarchy-nav' },
	// body: { xtype: 'forums-hierarchy-body'},

	storeCfg: {},
	storeExtraParams: {},


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

			this.relayEvents(this.body, ['pop-view', 'new-record', 'pop-to-root', 'highlight-ready']);
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
		var store = record.buildContentsStore('', this.storeCfg, this.storeExtraParams);

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

		delete store.proxy.extraParams.sorters;

		this.store.load();

		this.navigation.setCurrent(record, store);
	},


	getPageSource: function(record) {
		//if we don't have a page source and we have a model to use, create a page source
		if (!this.pageSource && this.model) {
			this.pageSource = NextThought.proxy.PageSource.create({
				current: record,
				model: this.model,
				url: NextThought.proxy.PageSource.urlFrom(this.store),
				idExtractor: function(o) {
					return o && o.get('OID');
				}
			});
		} else {
			this.pageSource.setCurrent(record);
		}

		return this.pageSource;
	},


	setCurrentBody: function(record) {
		var pageSource;

		if (!record || !record.isModel) {
			if (this.currentRecord.activeRecord) {
				record = this.currentRecord.activeRecord;
			} else if (this.currentRecord.activeNTIID) {
				record = this.store.getById(this.currentRecord.activeNTIID);
			} else {
				record = this.store.getCount() > 0 ? this.store.getAt(0) : null;
			}
		}

		pageSource = this.getPageSource(record);


		//setCurrent returns true if it updated the active record, false otherwise
		if (this.body.setCurrent(record, this.currentRecord, this.pageSource)) {
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
