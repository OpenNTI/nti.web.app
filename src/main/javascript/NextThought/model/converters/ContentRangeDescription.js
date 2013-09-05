Ext.define('NextThought.model.converters.ContentRangeDescription', {
	override: 'Ext.data.Types',
	requires: ['Ext.data.SortTypes'],

	CONTENTRANGEDESCRIPTION: {
		type: 'ContentRangeDescription',
		convert: function(v,record) {
			try {
				if (v) {
					return NextThought.model.anchorables.ContentRangeDescription.createFromObject(v);
				}
				else {
					return null;
				}
			}
			catch (e) {
				console.error('CRD: Parsing Error: ',e.message, e.stack, arguments);
				return null;
			}
		}
	}
});
