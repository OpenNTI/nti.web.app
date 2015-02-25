/**
 * A CACHE to hold a shared instance of a record to be shared across
 * different views and components, so a change to one will trigger
 * a change to all
 */
Ext.define('NextThought.cache.SharedInstance', {

	constructor: function(config) {
		//TODO: We might need to have multiple keys point to the same record
		//so we would need a KEY_TO_INDEX and INDEX_TO_RECORD
		this.KEY_TO_RECORD = {};
		this.callParent(arguments);
	},

	/**
	 * Given a record determine what key should be used to locate it
	 * can be overridden
	 * @param  {Model|JSON} record the record to look up or data for a record
	 * @return {String}        key
	 */
	getKeyForRecord: function(record) {
		var key;

		if (record.get) {
			key = record.getId();
		} else {
			key = record.NTIID;
		}

		return key;
	},

	/**
	 * Given a record return the url used to get it
	 * can be overridden
	 * @param  {Model|JSON} record record to get url for or data for a record
	 * @return {String}        the url
	 */
	getHrefForRecord: function(record) {
		var href;

		if (record.get) {
			href = record.get('href');
		} else {
			href = record.href;
		}

		return href;
	},


	__getRecordForKey: function(key) {
		return this.KEY_TO_RECORD[key];
	},


	__storeRecordAtKey: function(key, record) {
		if (!this.KEY_TO_RECORD[key]) {
			this.KEY_TO_RECORD[key] = record;
		} else {
			throw 'Key Collision';
		}
	},


	/**
	 * Set the values of the record from the server to the shared instance
	 * @param {String} key key for the record
	 * @param {Object} json the values to update the data with
	 */
	__updateRecord: function(key, json) {
		var cachedRecord = this.__getRecordForKey(key);

		//TODO check the last modified to see if the client got a cached version
		//so we don't overwrite any local changed

		cachedRecord.set(json);
	},


	/**
	 * Fetch the record from the server and update the values in the shared instance
	 * @param  {Model} record record to sync
	 */
	__syncRecordWithServer: function(record) {
		var href = this.getHrefForRecord(record),
			key = this.getKeyForRecord(record);

		if (!href) {
			console.log('No href to sync record with');
			return;
		}

		Service.request(href)
			.then(this.__updateRecord.bind(this, key))
			.fail(function(reason) {
				console.error('Failed to get record for sync', reason);
				return Promise.reject();
			});
	},


	/**
	 * Given a record either:
	 *
	 * 1.) If we have it return a shared instance of it
	 * 2.) If its not already cached add it and return the it
	 *
	 * @param {Model|JSON} record record to get
	 * @param {Boolean} sync true to request the record from the server
	 * @param {Boolean} update update the shared instance's data with the data from the record
	 * @return {Model}        shared instance of that record
	 */
	getRecord: function(record, sync, update) {
		var key = this.getKeyForRecord(record),
			cachedRecord = key && this.__getRecordForKey(key);

		if (!cachedRecord) {
			this.__storeRecordAtKey(key, record);
			cachedRecord = record;
		}

		if (sync) {
			this.__syncRecordWithServer(record);
		}

		if (update) {
			this.__updateRecord(key, record.asJSON());
		}

		return cachedRecord;
	}
});
