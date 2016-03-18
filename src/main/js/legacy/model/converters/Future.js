var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.model.converters.Future', {
    override: 'Ext.data.Types',

    FUTURE: {
		type: 'Future',
		sortType: 'none',
		convert: function(v) {
			if (v && v.isModel) {
				return v;
			}

			return {
				isFuture: true
			};
		}
	}
}, function() {
	function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }
	set(this.FUTURE);
});
