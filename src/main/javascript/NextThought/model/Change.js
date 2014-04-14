Ext.define('NextThought.model.Change', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.GroupByTime'
	],

	NOTABLE_PROPERTY: 'RUGDByOthersThatIMightBeInterestedIn',

	idProperty: 'ID',
	fields: [
		{ name: 'ID', type: 'string' },
		{ name: 'ChangeType', type: 'string' },
		{ name: 'Item', type: 'singleItem' },
		{ name: 'CreatedTime', mapping: 'Last Modified', type: 'date', persist: false, dateFormat: 'timestamp', defaultValue: new Date(0) },
		{ name: 'EventTime', mapping: 'Last Modified', type: 'groupByTime', affectedBy: 'Last Modified'},
		{ name: 'GroupingField', mapping: 'Last Modified', type: 'groupByTime', persist: false, affectedBy: 'Last Modified'}
	],

	getItemValue: function(field) {
		var i = this.get('Item');

		if (!i) {
			return null;
		}

		return i.get(field);
	},


	isNotable: function() {
		return !!(this.raw || {})[this.NOTABLE_PROPERTY];
	}
});
