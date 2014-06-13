Ext.define('NextThought.model.Change', {
	extend: 'NextThought.model.Base',
	requires: [
		'NextThought.model.converters.GroupByTime',
		'NextThought.model.openbadges.Badge'
	],

	NOTABLE_PROPERTY: 'RUGDByOthersThatIMightBeInterestedIn',

	constructor: function() {
		this.callParent(arguments);

		this.changeTypeToModel = {
			BadgeEarned: NextThought.model.Badge
		};
	},

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
		var i = this.getItem();

		if (!i) {
			return null;
		}

		return i.get(field);
	},


	getItem: function() {
		var item = this.get('Item'),
			changeModel = this.changeTypeToModel[this.get('ChangeType')];

		if (!item && changeModel) {
			item = changeModel.create({
				'Last Modified': this.get('Last Modified'),
				isEmpty: true
			});

			this.set('Item', item);
		}

		return item;
	},


	isNotable: function() {
		return !!(this.raw || {})[this.NOTABLE_PROPERTY];
	}
});
