const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.proxy.writer.Json', {
	extend: 'Ext.data.writer.Json',
	alias: 'writer.nti',

	constructor: function () {
		this.callParent(arguments);
	},

	getRecordData: function (object) {
		var defaults = this.callParent(arguments),
			output = {},
			key;

		function getJSON (obj) {
			if (obj && Ext.isFunction(obj.asJSON)) {
				obj = obj.asJSON();
			}
			else if (Ext.isArray(obj)) {
				obj = Ext.Array.map(obj, getJSON);
			}
			return obj;
		}

		//filter out falsy values
		for (key in defaults) {
			if (defaults.hasOwnProperty(key) && defaults[key]) {
				output[key] = getJSON(defaults[key]);
			}
		}

		//remove unnecessary JSON
		delete output.Class;
		delete output.Links;

		//console.debug('Output:',output);
		//console.debug('Trimed Keys:',Ext.Array.difference(Ext.Object.getKeys(defaults),Ext.Object.getKeys(output)));

		return output;
	},

	writeRecords: function (request, data) {
		request = this.callParent(arguments);

		//Because of ExtJS bug where jsonData is sent on delete, check to see if we
		//are making a DELETE request (aka destroy) and remove jsonData.  Also check
		//to see when the bug is fixed and log it so we remove this extra step when possible.
		if (request.action === 'destroy') {
			if (!request.jsonData || request.jsonData.length === 0) {
				console.warn('SAFE TO REMOVE EXTJS BUG WORKAROUND, request to delete has no jsonData', request);
			}
			delete request.jsonData;
		}

		return request;
	}
});
