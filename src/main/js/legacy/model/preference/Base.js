const Ext = require('@nti/extjs');

const Base = require('legacy/model/Base');

require('legacy/proxy/Preference');


module.exports = exports = Ext.define('NextThought.model.preference.Base', {
	extend: 'Ext.data.Model',
	idProperty: 'Class',

	fields: [
		{name: 'Class', type: 'String', persist: false},
		{name: 'MimeType', type: 'String', useNull: false}
	],

	subPreferences: [],
	proxy: {type: 'preference', reader: 'json'},

	getResourceUrl: function () {
		return $AppConfig.Preferences.baseUrl;
	},

	save: function (ops) {
		var me = this,
			url = me.getResourceUrl(),
			request = Ext.apply({
				url: url,
				method: 'PUT',
				jsonData: me.asJSON(),
				callback: function (req, success) {
					if (success) {
						me.fireEvent('changed', me);
					}
				}
			}, ops);

		Ext.Ajax.request(request);
	}
}, function () {
	this.borrow(Base, ['asJSON']);
});
