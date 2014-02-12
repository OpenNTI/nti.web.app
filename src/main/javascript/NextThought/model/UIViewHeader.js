Ext.define('NextThought.model.UIViewHeader', {
	extend: 'Ext.data.Model',

	isHeader: true,
	idProperty: 'GroupingFieldString',
	fields: [
		{name: 'divider', type: 'bool', defaultValue: true},
		{name: 'GroupingField', type: 'auto'},
		{name: 'GroupingFieldString', type: 'string', mapping: 'GroupingField'},
		{name: 'label', type: 'string'}
	]
});
