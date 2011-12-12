Ext.define('NextThought.proxy.reader.PageItem', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.nti-pageitem',
	initialConfig: {root: 'Items'},

	readRecords: function(data) {
		var records = [], key, items = data.Items || {},
			result, i, record;

		for(key in items){
			if(!items.hasOwnProperty(key))continue;
			records.push(items[key]);
		}

		try {
			result = this.callParent([records]);
			i = result.records.length-1;
			for(; i>=0; i--){
				record = result.records[i];
				result.records[i] = Ext.create(
						'NextThought.model.'+record.get('Class'),
						Ext.clone(record.raw),
						record.getId(),
						record.raw
				);
			}

			return result;
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
