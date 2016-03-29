var Ext = require('extjs');
var ReaderJson = require('./reader/Json');
var WriterJson = require('./writer/Json');


module.exports = exports = Ext.define('NextThought.proxy.Search', {
	extend: 'Ext.data.proxy.Rest',
	alias: 'proxy.search',
	appendId: false,

	//default
	reader: {type: 'nti'},

	constructor: function (config) {
		Ext.copyTo(this.reader, config, 'model');
		this.callParent(arguments);
		this.on('exception', this.exception, this);
	},

	buildUrl: function (request) {
		var f = Ext.JSON.decode(request.params.filter) || [{}];

		request.url = this.url + (f[0].value || '*');
		request.params = undefined;
		return this.callParent(arguments);
	},

	exception: function (proxy, resp, operation) {
		try {
			Ext.callback(operation.failed, operation.scope, [operation.records, operation]);
		}
		catch (e) {
			console.error(e.message, e);
		}
		if (resp.status !== 404) {
			console.error('Error searching, try again later', arguments);
		}
	}
});
