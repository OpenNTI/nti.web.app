const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.search.components.results.Note', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-note',

	clicked: function (e) {
		var me = this,
			fragEl = e.getTarget('[ordinal]'),
			fragIndex = fragEl && fragEl.getAttribute('ordinal');

		me.getObject
			.then(function (obj) {
				me.navigateToSearchHit(obj, me.hit, fragIndex, obj.getId());
			});
	}
});
