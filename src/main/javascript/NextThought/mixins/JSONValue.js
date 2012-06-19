Ext.define('NextThought.mixins.JSONValue',{

	ignoredKeyMap: {
		config: true,
		initialConfig: true
	},

	asJSON: function(){
		return this.getJSONObject(this);
	},

	getJSONObject: function(obj){
		var me = this,
			m = this.ignoredKeyMap,
			result = {};

		//if it's not an obj, return
		if (!obj || typeof obj !== 'object'){return obj;}

		Ext.Object.each(obj, function(k, v){
			if (!Ext.isFunction(v) && k.charAt(0)!=='_' && !m.hasOwnProperty(k)) {
				if (Ext.isArray(v)) {
					result[k] = [];
					Ext.each(v, function(a){
						result[k].push(me.getJSONObject(a));
					});
				}
				else if (typeof v === 'object') {
					result[k] = me.getJSONObject(v);
				}
				else {result[k] = v}
			}
		});
		return result;
	}
});