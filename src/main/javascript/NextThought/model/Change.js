Ext.define('NextThought.model.Change', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.GroupByTime'
	],

	fields: [
		{ name: 'ChangeType', type: 'string' },
		{ name: 'Item', type: 'singleItem' },
		{ name: 'EventTime', mapping: 'Last Modified', type: 'groupByTime'}
	],

	getItemValue: function(field) {
		var i = this.get('Item');

		if (!i) {
			return null;
		}

		return i.get(field);
	}
});
