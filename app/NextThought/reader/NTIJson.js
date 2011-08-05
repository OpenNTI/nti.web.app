Ext.define('NextThought.reader.NTIJson', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.nti',
 	initialConfig: {root: 'Items'},
 	
	readRecords: function(data) {
		var me = this,
			i = data.Items,
			records = [];
		
		//special case where data returns to us after saving without an array
		if (!i && !Ext.isArray(data)) {
			return this.callParent([data]);
		}
		
		if (me.hasId) {
			return this.callParent(arguments);
		}
		
		if (me.hasNtiid){
			records = this.getNestedRecords(i);
		}
		else {
			for (var key in i) {
				if (!i.hasOwnProperty(key)) continue;
				records = records.concat(this.getNestedRecords(i[key]));
			}
		}	
		// console.log('in readRecords', records);
		return this.callParent([records]);
	},
	getNestedRecords: function(collection) {
		var result = [];
		for (var key in collection) {
			var o = collection[key];
			if (!collection.hasOwnProperty(key) || typeof(o) != 'object') continue;
			result.push(o);					
		}
		return result;
	}
 });