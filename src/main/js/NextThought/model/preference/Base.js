export default Ext.define('NextThought.model.preference.Base', {
	extend: 'Ext.data.Model',
	requires: ['NextThought.model.converters.Future', 'NextThought.proxy.Preference', 'NextThought.model.Base'],

	idProperty: 'Class',

	fields: [
		{name: 'Class', type: 'String', persist: false},
		{name: 'MimeType', type: 'String', useNull: false}
	],

	subPreferences: [],

	proxy: {type: 'preference', reader: 'json'},

	getResourceUrl: function() {
		return $AppConfig.Preferences.baseUrl;
	},

	save: function(ops) {
		var request, me = this,
			url = me.getResourceUrl();
			request = Ext.apply({
				url: url,
				method: 'PUT',
				jsonData: me.asJSON(),
				callback: function(req, success, resp) {
					if (success) {
						me.fireEvent('changed', me);
					}
				}
			}, ops);

		Ext.Ajax.request(request);
	}

}, function() {
	this.borrow(NextThought.model.Base, ['asJSON']);
});
