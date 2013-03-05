Ext.define('NextThought.store.Blog',{
	extend: 'Ext.data.Store',
	alias: 'store.blog',

	requires: [
		'NextThought.proxy.reader.Json'
	],
	model: 'NextThought.model.forums.PersonalBlogEntry',

	proxy: {
		url: 'tbd',
		type: 'rest',
		reader: {
			type: 'nti',
			root: 'Items',
			totalProperty: 'TopicCount'
		},
		extraParams:{
			sortOn: 'createdTime',
			sortOrder: 'descending'
		},
		headers: { 'Accept': 'application/vnd.nextthought.collection+json' },
		model: 'NextThought.model.forums.PersonalBlogEntry'
	},

	constructor: function(){
		var r = this.callParent(arguments);
		this.on('write', this.onWrite);
		return r;
	},


	onWrite: function(store, info) {
		if (info.action === 'destroy') {
			Ext.each(info.records, function(record){
				store.remove(record);
			});
		}
	},


	remove: function(records){
		this.callParent(arguments);

		Ext.each(records, function(record){
			record.fireEvent('destroy',record);
		});

	}
});
