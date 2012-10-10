Ext.define('NextThought.model.converters.DCCreatorToAuthor', {
	override: 'Ext.data.Types',


	DCCREATORTOAUTHOR: {
		type: 'DCCreatorToAuthor',
		convert: function(v) {
			return v.join(', ');
		},
		sortType: Ext.data.SortTypes.none
	}
});
