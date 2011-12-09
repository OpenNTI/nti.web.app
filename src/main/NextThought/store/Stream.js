Ext.define('NextThought.store.Stream',{
    extend: 'Ext.data.Store',

	model: 'NextThought.model.Change',
	autoLoad: false,
	proxy: {
		type: 'rest',
		reader: {
			type: 'json',
			root: 'Items'
		},
		model: 'NextThought.model.Change'
	},
	sorters: [
		{
			property : 'Last Modified',
			direction: 'ASC'
		}
	]
});
