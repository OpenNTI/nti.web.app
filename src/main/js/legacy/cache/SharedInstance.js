var Ext = require('extjs');
var ParseUtils = require('../util/Parsing');


/**
 * A CACHE to hold a shared instance of a record to be shared across
 * different views and components, so a change to one will trigger
 * a change to all
 */
module.exports = exports = Ext.define('NextThought.cache.SharedInstance', {

	//A list of props to include in the JSON of a record when updating
	UPDATE_WHITELIST: ['href', 'IsExcused', 'Links'],

	constructor: function (config) {
		//TODO: We might need to have multiple keys point to the same record
		//so we would need a KEY_TO_INDEX and INDEX_TO_RECORD
		this.KEY_TO_RECORD = {};

		if (config) {
			Ext.apply(this, config);
		}

		this.callParent(arguments);
	},

	/**
	 * Given a record determine what key should be used to locate it
	 * can be overridden
	 * @param  {ModelInstance|JSON} record the record to look up or data for a record
	 * @return {String}		   key
	 */
	getKeyForRecord: function (record) {
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
	 * @param  {ModelInstance|JSON} record record to get url for or data for a record
	 * @return {String}		   the url
	 */
	getHrefForRecord: function (record) {
		var href;

		if (record.get) {
			href = record.get('href');
		} else {
			href = record.href;
		}

		return href;
	},


	__getRecordForKey: function (key) {
		return this.KEY_TO_RECORD[key];
	},


	__storeRecordAtKey: function (key, record) {
		if (!this.KEY_TO_RECORD[key]) {
			this.KEY_TO_RECORD[key] = record;
		} else {
			throw 'Key Collision';
		}
	},


	/**
	 * Set the values of the record from the server to the shared instance
	 * @param {String} key key for the record
	 * @param {ModelInstance} record the record to sync from
	 */
	__updateRecord: function (key, record) {
		var cachedRecord = this.__getRecordForKey(key),
			json = record.asJSON(), i, prop, value;

		for (i = 0; i < this.UPDATE_WHITELIST.length; i++) {
			prop = this.UPDATE_WHITELIST[i];
			value = record.get(prop);

			if (value !== undefined) {
				json[prop] = value;
			}

			json[prop] = record.get(prop);
		}


		cachedRecord.set(json);
	},


	/**
	 * Fetch the record from the server and update the values in the shared instance
	 * @param  {ModelInstance} record record to sync
	 */
	__syncRecordWithServer: function (record) {
		var href = this.getHrefForRecord(record),
			key = this.getKeyForRecord(record);

		if (!href) {
			console.log('No href to sync record with');
			return;
		}

		Service.request(href)
			.then(this.__updateRecord.bind(this, key))
			.catch(function (reason) {
				console.error('Failed to get record for sync', reason);
				return Promise.reject();
			});
	},


	/**
	 * Given a record either:
	 *
	 * 1.) If we have it return a shared instance of it
	 * 2.) If its not already cached add it and return the cached record
	 *
	 * @param {ModelInstance} record record to get
	 * @param {Boolean} sync true to request the record from the server
	 * @param {Boolean} forceUpdate update the shared instance's data with the data from the record
	 * @return {ModelInstance}		  shared instance of that record
	 */
	getRecord: function (record, sync, forceUpdate) {
		var key = this.getKeyForRecord(record),
			cachedRecord = key && this.__getRecordForKey(key),
			lastMod = record.get ? record.get('Last Modified') : record['Last Modified'],
			cachedLastMod = cachedRecord && cachedRecord.get('Last Modified');

		if (!cachedRecord) {
			if (!record.isModel) {
				record = ParseUtils.parseItems(record)[0];
			}

			this.__storeRecordAtKey(key, record);
			cachedRecord = record;
		}

		if (sync) {
			this.__syncRecordWithServer(record);
		}

		//If the record has been modified after the cached copy, update the cache
		if (lastMod > cachedLastMod || forceUpdate) {
			this.__updateRecord(key, record);
		}

		return cachedRecord;
	},


	/**
	 * Given a key find the record in the cache if it exists
	 * @param  {String} key key for the record
	 * @return {ModelInstance}	   the cached record
	 */
	findRecord: function (key) {
		return this.__getRecordForKey(key);
	}
});
