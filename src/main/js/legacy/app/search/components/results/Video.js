const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.search.components.results.Video', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-ntitranscript',

	fetchObject () {
		let containerId = this.hit && this.hit.get('ContainerId');
		if (!containerId && this.hit) {
			containerId = (this.hit.get('Containers') || [])[0];
		}
		return Service.getObject(containerId);
	},

	clicked: function (e) {
		var me = this,
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
