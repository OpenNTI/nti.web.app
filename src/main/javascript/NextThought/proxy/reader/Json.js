
Ext.define('NextThought.proxy.reader.Json', {
	extend: 'Ext.data.reader.Json',
	alias : 'reader.nti',
	initialConfig: {root: 'Items'},

	readRecords: function(data) {
		var records = [], key,
			items = data.Items, item,
			mimeType = data.MimeType,
			result, i, record, modelName;

		if(data.request) {
			if( data.status !== 204 ){
				console.warn('Unknown response?',data);
			}
			return [];
		}

		if(mimeType === 'application/vnd.nextthought.collection' || (mimeType===undefined && items)) {
			for(key in items){
				if(items.hasOwnProperty(key)){
					item = items[key];

					if(typeof(item)==='string'){
						console.warn('IGNORING: Received string item at key:', key, item);
						continue;
					}

					if(!item.Class || !ParseUtils.findModel(item.Class)){
						console.warn('IGNORING: Received object that does not match a model',item);
						continue;
					}

					records.push(items[key]);
				}
			}

            data.Items = records;
		} else {
			data = [data];
		}

		try {

			result = this.callParent([data]);

			i = result.records.length-1;
			for(i; i>=0; i--){
				record = result.records[i];
				try{
					if(record instanceof NextThought.model.Base) {
						modelName = record.get('Class');
						if(record.modelName.substr(-modelName.length) !== modelName){
							result.records[i] = ParseUtils.findModel(modelName).create( record.raw, record.getId() );
							delete record.raw;
						}
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
