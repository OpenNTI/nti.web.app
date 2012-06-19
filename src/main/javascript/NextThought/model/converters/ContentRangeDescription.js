Ext.define('NextThought.model.converters.ContentRangeDescription', {
	override: 'Ext.data.Types',

	CONTENTRANGEDESCRIPTION: {
		type: 'ContentRangeDescription',
		convert: function(v,record) {
			try {
				return NextThought.model.anchorables.DomContentRangeDescription.createFromObject(v);
			}
			catch (e) {
				console.error('CRD: Parsing Error: ',e.message, e.stack, arguments);
				return null;
			}
		}
	}
});
