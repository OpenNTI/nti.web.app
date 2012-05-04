Ext.define('NextThought.store.Hit',{
	extend: 'Ext.data.Store',

	requires: [
		'NextThought.proxy.reader.Json'
	],

	model: 'NextThought.model.Hit',
	autoLoad: false,
	groupField: 'Type',
	proxy: {
		type: 'nti',
		reader: {
			type: 'nti',
			root: 'Items'
		}
	}
});