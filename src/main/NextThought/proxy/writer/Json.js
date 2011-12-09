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

		//filter out falsy values
        for (key in defaults) {
            if (!defaults.hasOwnProperty(key) || !defaults[key]) continue;
            output[key] = defaults[key];
        }

		delete output.Class;

        //console.debug('defaults = ', defaults, 'output = ', output);
        return output;
    }
});

