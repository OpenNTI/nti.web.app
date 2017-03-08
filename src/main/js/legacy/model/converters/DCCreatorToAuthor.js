var Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.model.converters.DCCreatorToAuthor', {
	override: 'Ext.data.Types',

	DCCREATORTOAUTHOR: {
		type: 'DCCreatorToAuthor',
		convert: function (v) {
			if (!Array.isArray(v)) {
				return v;
			}

			return v && v.join(', ');
		},
		sortType: 'none'
	}
}, function () {
	this.DCCREATORTOAUTHOR.sortType = Ext.data.SortTypes.none;
});
