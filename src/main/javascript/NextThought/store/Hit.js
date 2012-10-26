Ext.define('NextThought.store.Hit',{
	extend: 'Ext.data.Store',

	requires: [
		'NextThought.proxy.reader.Json',
		'NextThought.filter.FilterGroup',
		'NextThought.filter.Filter'
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
	},

	loadRecords: function(records, options){
		var response = Ext.JSON.decode(options.response.responseText, true),
			me = this;
		if(response){
			this.phraseSearch = response.PhraseSearch;
			if(this.phraseSearch !== undefined){
				// Until we decide we want to replum all the search stuff to take an
				// additional parameter add it from the root to each record.
				Ext.each(records, function(record){
					record.set('PhraseSearch', me.phraseSearch);
				});
			}
		}

		return this.callParent(arguments);
	}

});

