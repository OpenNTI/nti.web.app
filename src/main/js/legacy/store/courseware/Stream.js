const Ext = require('@nti/extjs');
const moment = require('moment');

const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const StoreUtils = require('legacy/util/Store');


module.exports = exports = Ext.define('NextThought.store.courseware.Stream', {

	params: {
		NonEmptyBucketCount: 2,
		BucketSize: 50
	},

	EMPTY_BIN: {
		BucketItemCount: 0,
		Items: []
	},


	constructor: function (config) {

		//A map of start date to bin
		this.WEEK_MAP = {};

		/**
		 * Holds objects that has
		 *{
		 *	start: TimeStamp,
		 *	end: TimeStamp,
		 *	key: Number, key in the WEEK_MAP
		 *}
		 * @type {Array}
		 */
		this.WEEK_RANGES = [];

		this.url = config.url;
		this.latestBinDate = moment.utc().endOf('isoWeek').toDate().getTime();
		this.params.Oldest = (config.startDate || new Date(0)).getTime() / 1000;//the server is expecting seconds

		this.__loadNextBatch();
	},


	__loadNextBatch: function () {
		var me = this;

		if (me.loading && !me.noMoreBins) {
			return me.loadingPromise;
		}

		me.loading = true;

		me.params.MostRecent = me.latestBinDate / 1000; //the server is expecting seconds

		//If we ever get in a case where we are requesting a batch with no time range.
		if (me.params.MostRecent <= me.params.Oldest) {
			me.__binItems([]);

			return Promise.resolve([]);
		}

		me.loadingPromise = StoreUtils.loadRawItems(me.url, me.params)
			.then(function (response) {
				me.loading = false;
				return Ext.decode(response, true);
			})
			.then(function (json) {
				me.__binItems(json.Items);
			})
			.catch(function (reason) {
				console.log('Failed to load stream: ', reason);
				return Promise.reject();
			});

		return me.loadingPromise;
	},


	__binItems: function (bins) {
		var i, key;

		for (i = 0; i < bins.length; i++) {
			key = this.WEEK_RANGES.length;

			this.WEEK_RANGES.push({
				start: moment.utc(bins[i].OldestTimestamp * 1000).startOf('isoWeek'), //timestamps are in seconds
				end: moment.utc(bins[i].MostRecentTimestamp * 1000),
				key: key
			});

			bins[i].Items = lazy.ParseUtils.parseItems(bins[i]);

			this.WEEK_MAP[key] = bins[i];
		}

		if (bins.length) {
			this.latestBinDate = bins.last().OldestTimestamp * 1000;
		} else {
			this.noMoreBins = true;
		}
	},


	__getCachedBin: function (date) {
		var ranges = this.WEEK_RANGES, i,
			range;

		for (i = 0; i < ranges.length; i++) {
			range = ranges[i];

			if (range.start.isSame(date.startOf('isoWeek'))) {
				return this.WEEK_MAP[range.key];
			}
		}
	},


	__getOrLoadBin: function (date) {
		var me = this,
			cached = me.__getCachedBin(date);

		//if we've already loaded that week return it
		if (cached) {
			return Promise.resolve(cached);
		}

		//if we've haven't loaded that week, but we have loaded
		if (date.isAfter(me.latestBinDate) || date.isSame(me.latestBinDate) || me.noMoreBins) {
			return Promise.resolve(me.EMPTY_BIN);
		}

		return me.__loadNextBatch()
			.then(function () {
				return me.__getOrLoadBin(date);
			})
			.catch(function () {
				return Ext.clone(me.EMPTY_BIN);
			});
	},


	getWeek: function (date) {
		date = moment.utc(date);

		return this.__getOrLoadBin(date)
			.then(function (bin) {
				return bin.Items;
			});
	}
});
