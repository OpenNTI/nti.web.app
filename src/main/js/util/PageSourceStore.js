var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.util.PageSourceStore', {

	isPageSource: true,

	mixins: {
		observable: 'Ext.util.Observable'
	},

	config: {
		store: null,
		current: 0
	},


	constructor: function(cfg) {
		this.mixins.observable.constructor.call(this);
		this.initConfig(cfg);

		if (this.store.isPageSource) {
			this.store = this.store.store;
		}
	},

	/**
	 * If we have a backing store and it has an instance of the record update the backing store
	 * to be up to date with the record
	 * @param  {Model} record the record in the page source that was updated
	 * @param  {String} field  the field to update, if falsy update every field
	 */
	syncBackingStore: function(record, field) {
		if (!this.backingStore) { return; }

		var storeRec, data;

		//getById will throw an error if its not there, we are okay with it not being there
		//so catch it and don't blow up
		try {
			//if the backing store has a function to find the record use it
			if (this.backingStore.getFromPageSourceRecord) {
				storeRec = this.backingStore.getFromPageSourceRecord(record);
			} else {
				//else just look for the same id
				storeRec = this.backingStore.getById(record.getId());
			}
		} catch (e) {
			console.error('No record in backingstore for ', record);
		} finally {
			if (storeRec) {
				//if we are passed a field only update that field
				if (field) {
					storeRec.set(field, record.get(field));
				} else {
					data = record.getData();
					//don't trigger an id change
					delete data[record.idProperty];
					storeRec.set(data);

					if (storeRec.onSynced) {
						storeRec.onSynced();
					}
				}
			}
		}
	},


	getTotal: function() {
		var s = this.store,
			count = s.getCount(),
			total = s.getTotalCount();

		if (s.isFiltered() && !s.remoteFilter) {
			return count;
		}

		return total;
	},


	getPageNumber: function() {
		//pages are a 1 based index, where our current position is a 0 based index.
		return this.getCurrentPosition() + 1;
	},


	getCurrentPosition: function() {
		return this.current;
	},


	getCurrent: function() {
		return this.store.getAt(this.current);
	},


	getNext: function() {
		var n = this.getCurrentPosition() + 1;
		if (n >= this.getTotal()) {
			n = 0;
		}
		this.current = n;
		return this.store.getAt(n);
	},


	getPrevious: function() {
		var n = this.getCurrentPosition() - 1;
		if (n < 0) {
			n = this.getTotal() - 1;
		}
		this.current = n;
		return this.store.getAt(n);
	},


	hasNext: function() {
		if (!this.store) { return false; }
		var n = this.getCurrentPosition() + 1;

		if (n < this.getTotal()) {
			return true;
		}
		return false;
	},


	hasPrevious: function() {
		if (!this.store) { return false; }
		var n = this.getCurrentPosition() - 1;

		if (n >= 0) {
			return true;
		}
		return false;
	}
});


