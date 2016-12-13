var Ext = require('extjs');
var ResultsBase = require('./Base');


module.exports = exports = Ext.define('NextThought.app.search.components.results.Video', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-ntitranscript',

	fetchObject () {
		return Service.getObject(this.hit && this.hit.getContainerId());
	},

	clicked: function (e) {
		var me = this,
			hit = me.hit,
			start = me.hit.get('StartMilliSecs'),
			fragEl = e.getTarget('[ordinal]'),
			fragIndex = fragEl && fragEl.getAttribute('ordinal');

		this.getObject
			.then(function (obj) {
				obj.startMillis = start || 0;
				me.navigateToSearchHit(obj, me.hit, fragIndex, me.hit.get('VideoID'));
			});
	}
});
