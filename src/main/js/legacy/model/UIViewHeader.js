const Ext = require('extjs');


module.exports = exports = Ext.define('NextThought.model.UIViewHeader', {
	extend: 'Ext.data.Model',

	isHeader: true,
	idProperty: 'GroupingFieldString',
	fields: [
		{name: 'divider', type: 'bool', defaultValue: true},
		{name: 'GroupingField', type: 'auto'},
		{name: 'NotificationGroupingField', type: 'auto'},
		{name: 'GroupingFieldString', type: 'string', mapping: 'GroupingField'},
		{name: 'depth', type: 'number'},
		{name: 'cls', type: 'string'},
		{name: 'attr', type: 'string'},
		{name: 'label', type: 'string'}
	]
});
