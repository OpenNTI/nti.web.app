Ext.define('NextThought.proxy.reader.Json', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.nti',
	initialConfig: {root: 'Items'},

	constructor: function() {
		this.callParent(arguments);
	},
	
	
	readRecords: function(data) {
        if(!this.model){
            Ext.Error.raise('The model is undefined. Did we forget to require it somewhere?');
        }


        var me = this,
			//mName = me.model.$className,
            records = [], i = me.root===false? data : data.Items,
			key;

		// console.debug('read records:',mName,
		// 'this:', me,
		// 'root:', me.root,
		// 'i', i,
		// 'args:',arguments);

		
		if(Ext.isArray(data) || me.hasId){
			return this.callParent(arguments);
		}
		//special case where data returns to us after saving without an array
		else if (!i) {
			return this.callParent([data]);
		}
		
		if (me.hasContainerId){
			records = this.getNestedRecords(i);
		}
		else {
			for (key in i) {
				if (!i.hasOwnProperty(key)) continue;
				records = records.concat(this.getNestedRecords(i[key]));
			}
		}	
		
//		console.debug('read records result:',mName, records);

        try {
		    return this.callParent([records]);
        }
        catch (err) {
            return Ext.create('Ext.data.ResultSet', {
                total  : 0,
                count  : 0,
                records: [],
                success: true
            });
        }
	},
	
	getNestedRecords: function(collection) {
		var result = [], key;
		for (key in collection) {
			if (!collection.hasOwnProperty(key) || typeof(collection[key]) != 'object') continue;
			result.push(collection[key]);
		}
		return result;
	}
 });
