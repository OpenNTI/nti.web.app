Ext.define('NextThought.model.converters.DCCreatorToAuthor', {
	override: 'Ext.data.Types',
	requires: ['Ext.data.SortTypes'],

	DCCREATORTOAUTHOR: {
		type: 'DCCreatorToAuthor',
		convert: function(v) {
			return v.join(', ');
		},
		sortType: 'none'
	}
}, function() {
	this.DCCREATORTOAUTHOR.sortType = Ext.data.SortTypes.none;
});
