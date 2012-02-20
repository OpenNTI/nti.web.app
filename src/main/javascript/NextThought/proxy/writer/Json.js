Ext.define('NextThought.proxy.writer.Json', {
	extend: 'Ext.data.writer.Json',
	alias : 'writer.nti',

	constructor: function() {
		this.callParent(arguments);
	},

	getRecordData: function(obj) {
		var defaults = this.callParent(arguments),
			output = {},
			key;

		function getJSON(obj) {
			var a=[];
			if (obj instanceof NextThought.model.Base) {
				return obj.asJSON();
			}
			else if (Ext.isArray(obj)) {
				Ext.each(obj, function (o){
					a.push(getJSON(o));
				});
				return a;
			}
			return obj;
		}

		//filter out falsy values
		for (key in defaults) {
			if (defaults.hasOwnProperty(key) && defaults[key]) {
				output[key] = getJSON(defaults[key]);
			}
		}

		delete output.Class;
		delete output.Links;

		//console.debug('Output:',output);
		//console.debug('Trimed Keys:',Ext.Array.difference(Object.keys(defaults),Object.keys(output)));

		return output;
	}
});

