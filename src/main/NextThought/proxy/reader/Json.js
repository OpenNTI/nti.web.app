Ext.define('NextThought.proxy.reader.Json', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.nti',
	initialConfig: {root: 'Items'},

	readRecords: function(data) {
		var records = [], key, items = data.Items || {}, item,
			result, i, record, modelName;

		for(key in items){
			if(!items.hasOwnProperty(key))continue;
			item = items[key];

			if(typeof(item)==='string'){
				console.warn('IGNORING: Received string item at key:', key, item);
				continue;
			}

			if(!item.Class || !(item.Class in NextThought.model)){
				console.warn('IGNORING: Received object that does not match a model');
				continue;
			}

			records.push(items[key]);
		}

		try {
			result = this.callParent([records]);

			i = result.records.length-1;
			for(; i>=0; i--){
				record = result.records[i];
				try{
					modelName = 'NextThought.model.'+record.get('Class');
					if(record.modelName != modelName){
//						console.debug('converting model:',modelName, 'from:', record.modelName);
						result.records[i] = Ext.create(
								modelName,
								Ext.clone(record.raw),
								record.getId(),
								record.raw
						);
					}
				}
				catch(e1){
					console.error(record, 'No model for record?');
				}
			}

			return result;
		}
		catch (e) {
			console.error(e.stack||e, records);
			return Ext.create('Ext.data.ResultSet', {
				total  : 0,
				count  : 0,
				records: [],
				success: false
			});
		}
	}
 });
