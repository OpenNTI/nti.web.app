Ext.define('NextThought.store.Stream',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.proxy.reader.Json'
	],

	model: 'NextThought.model.Change',

	autoLoad: false,

	proxy: {
		type: 'rest',
		reader: {
			type: 'json',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.Change'
	},

	groupField: 'EventTime',

	sorters: [
		{
			property : 'Last Modified',
			direction: 'DESC'
		}
	]
});
