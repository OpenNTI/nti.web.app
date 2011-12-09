Ext.define('NextThought.proxy.reader.JsonCollection', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.nti-collection',
	initialConfig: {root: 'Items'},

	readRecords: function(data) {

		var records = [], key, items = data.Items || {};

		for(key in items){
			if(!items.hasOwnProperty(key))continue;
			records.push(items[key]);
		}

		try {
			return this.callParent([records]);
		}
		catch (e) {
			console.error(e, data);
			return Ext.create('Ext.data.ResultSet', {
				total  : 0,
				count  : 0,
				records: [],
				success: false
			});
		}
	}
 });
