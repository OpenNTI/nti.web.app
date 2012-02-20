Ext.define('NextThought.model.Change', {
	extend: 'NextThought.model.Base',
	fields: [
		{ name: 'ChangeType', type: 'string' },
		{ name: 'Item', type: 'singleItem' }
	],

	getItemValue: function(field) {
		var i = this.get('Item');

		if (!i) {
			return null;
		}

		return i.get(field);
	}
});
