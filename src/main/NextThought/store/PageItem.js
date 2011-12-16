Ext.define('NextThought.store.PageItem',{
    extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.reader.Json'
	],
	model: 'NextThought.model.GenericObject',
	autoLoad: false,
	groupField: 'Class',
	groupDir  : 'ASC',
	proxy: {
		type: 'rest',
		reader: {
			type: 'nti',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json'
		},
		model: 'NextThought.model.GenericObject'
	},


	getBins: function(){
		var groups = this.getGroups(),
			bins = {},
			k;

		for(k in groups){
			if(!groups.hasOwnProperty(k))continue;
			bins[groups[k].name] = groups[k].children;
		}

		return bins;
	}
});
