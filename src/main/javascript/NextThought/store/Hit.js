Ext.define('NextThought.store.Hit',{
	extend: 'Ext.data.Store',

	requires: [
		'NextThought.proxy.reader.Json'
	],

	model: 'NextThought.model.Hit',
	autoLoad: false,
	proxy: {
		type: 'nti',
		reader: {
			type: 'nti',
			root: 'Items'
		}
	}
});