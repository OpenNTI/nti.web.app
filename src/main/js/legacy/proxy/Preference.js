var Ext = require('extjs');
var ReaderJson = require('./reader/Json');


module.exports = exports = Ext.define('NextThought.proxy.Preference', {
    extend: 'Ext.data.proxy.Rest',
    alias: 'proxy.preference',
    url: '',
    appendId: false,

    //default
	reader: {
		type: 'nti',
		root: 'Items'
	},

    constructor: function(config) {
		Ext.copyTo(this.reader, config, 'model');
		this.callParent(arguments);
		this.on('exception', this.exception, this);
	},

    buildUrl: function(request) {
		request.url = request.params.id;
		return this.callParent(arguments);
	},

    exception: function(proxy, resp, operation) {
		try {
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch (e) {
			console.error(e.message, e);
		}
		if (resp.status !== 404) {
			console.error('Error searching for users, try again later', arguments);
		}
	}
});
