Ext.define('NextThought.store.Stream',{
	extend: 'Ext.data.Store',
	requires:[
		'NextThought.proxy.reader.Json'
	],

	model: 'NextThought.model.Change',

	autoLoad: false,
	pageSize: 5,

	proxy: {
		type: 'rest',
		limitParam: 'batchSize',
		pageParam: undefined,
		startParam: 'batchStart',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'FilteredTotalItemCount'
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
