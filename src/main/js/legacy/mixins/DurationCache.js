var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.mixins.DurationCache', {
	cacheFor: function(key, value, duration) {
		this.__durationCache = this.__durationCache || {};

		if (duration && duration > 0) {
			this.__durationCache[key] = value;

			if (duration < Infinity) {
				wait(duration)
					.then(this.removeFromCache.bind(this, key));
			}
		}

		return value;
	},

	cacheForShortPeriod: function(key, value) {
		return this.cacheFor(key, value, 300000);//300 seconds
	},

	cacheForever: function(key, value) {
		return this.cacheFor(key, value, Infinity);
	},


	getFromCache: function(key) {
		this.__durationCache = this.__durationCache || {};

		return this.__durationCache[key];
	},


	removeFromCache: function(key) {
		this.durationCache = this.__durationCache || {};

		delete this.__durationCache[key];
	}
});
