Ext.define('NextThought.reader.Json', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.nti',
 	initialConfig: {root: 'Items'},

	constructor: function() {
		this.callParent(arguments);
	},
	
	
	readRecords: function(data) {
		var me = this,
			mName = me.model.$className,
			i = data.Items,
			records = [];

		if(NextThought.isDebug) {
			console.log('read records:',mName, me, arguments);
		}
		
		if(Ext.isArray(data)){
			return this.callParent(arguments);
		}
		//special case where data returns to us after saving without an array
		else if (!i) {
			return this.callParent([data]);
		}
		
		else if (me.hasId) {
			return this.callParent(arguments);
		}
		

		
		if (me.hasContainerId){
			records = this.getNestedRecords(i);
		}
		else {
			for (var key in i) {
				if (!i.hasOwnProperty(key)) continue;
				records = records.concat(this.getNestedRecords(i[key]));
			}
		}	
		
		if(NextThought.isDebug) {
			console.log('read records result:',mName, records);
		}
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