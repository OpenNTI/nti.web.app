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
			if(groups.hasOwnProperty(k)) {
				bins[groups[k].name] = groups[k].children;
			}
		}

		return bins;
	},


	add: function(record) {
		//get added to the store:
		this.callParent(arguments);

		//find my parent if it's there and add myself to it:
		var parentId = record.get('replyTo');
		if (parentId) {
			Ext.each(this.data, function(parent){
				if (parentId === parent.getId()) {
					//found our parent:
					record.parent = parent;
					if (!parent.children){parent.children = [];}
					parent.children.push(record);
					//fire events for anyone who cares:
					parent.fireEvent('changed');
					record.fireEvent('changed');
				}
			});
		}
	}
});
