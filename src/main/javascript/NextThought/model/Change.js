Ext.define('NextThought.model.Change', {
	extend:   'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.GroupByTime'
	],

	idProperty: 'ID',
	fields:     [
		{ name: 'ID', type: 'string' },
		{ name: 'ChangeType', type: 'string' },
		{ name: 'Item', type: 'singleItem' },
		{ name: 'EventTime', mapping: 'Last Modified', type: 'groupByTime', affectedBy: 'Last Modified'}
	],

	getItemValue: function (field) {
		var i = this.get('Item');

		if (!i) {
			return null;
		}

		return i.get(field);
	}
});
