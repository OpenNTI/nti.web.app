Ext.define('NextThought.model.preference.Base',{
	extend: 'Ext.data.Model',
	requires: ['NextThought.model.converters.Future'],

	fields: [
		{name: 'Class', type: 'String', persist: false},
		{name: 'MimeType', type: 'String', useNull: false}
	]
});