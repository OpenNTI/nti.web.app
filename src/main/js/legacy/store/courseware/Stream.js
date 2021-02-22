const Ext = require('@nti/extjs');
const {
	startOfISOWeek,
	endOfISOWeek,
	isAfter,
	isSameSecond: isSame,
} = require('date-fns');

const lazy = require('legacy/util/lazy-require').get('ParseUtils', () =>
	require('legacy/util/Parsing')
);
const StoreUtils = require('legacy/util/Store');

module.exports = exports = Ext.define('NextThought.store.courseware.Stream', {
	params: {
		NonEmptyBucketCount: 2,
		BucketSize: 50,
	},

	EMPTY_BIN: {
		BucketItemCount: 0,
		Items: [],
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
		this.latestBinDate = endOfISOWeek(new Date()).getTime();
		this.params.Oldest = (config.startDate || new Date(0)).getTime() / 1000; //the server is expecting seconds

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
				start: startOfISOWeek(new Date(bins[i].OldestTimestamp * 1000)), //timestamps are in seconds
				end: new Date(bins[i].MostRecentTimestamp * 1000),
				key: key,
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
		var ranges = this.WEEK_RANGES,
			i,
			range;

		for (i = 0; i < ranges.length; i++) {
			range = ranges[i];

			if (isSame(startOfISOWeek(date), range.start)) {
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

		const latest = new Date(me.latestBinDate);
		//if we've haven't loaded that week, but we have loaded
		if (isAfter(latest, date) || isSame(latest, date) || me.noMoreBins) {
			return Promise.resolve(me.EMPTY_BIN);
		}

		return me
			.__loadNextBatch()
			.then(function () {
				return me.__getOrLoadBin(date);
			})
			.catch(function () {
				return Ext.clone(me.EMPTY_BIN);
			});
	},

	getWeek: function (date) {
		return this.__getOrLoadBin(date).then(function (bin) {
			return bin.Items;
		});
	},
});
