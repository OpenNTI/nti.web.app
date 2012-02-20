Ext.define('NextThought.model.Link', {
	extend: 'Ext.data.Model',
	fields: [
		{ name: 'Class', type: 'string' },
		{ name: 'href', type: 'string' },
		{ name: 'rel', type: 'string' },
		{ name: 'type', type: 'string' }
	]
});