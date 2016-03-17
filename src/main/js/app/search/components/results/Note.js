export default Ext.define('NextThought.app.search.components.results.Note', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-note',

	clicked: function(e) {
		var me = this,
			hit = me.hit,
			fragEl = e.getTarget('[ordinal]'),
			fragIndex = fragEl && fragEl.getAttribute('ordinal');

		me.getObject
			.then(function(obj) {
				me.navigateToSearchHit(obj, me.hit, fragIndex, obj.getId());
			});
	}
});
