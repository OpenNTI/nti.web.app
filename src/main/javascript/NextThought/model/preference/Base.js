Ext.define('NextThought.model.preference.Base', {
	extend: 'Ext.data.Model',
	requires: ['NextThought.model.converters.Future', 'NextThought.proxy.Preference'],

	idProperty: 'Class',

	fields: [
		{name: 'Class', type: 'String', persist: false},
		{name: 'MimeType', type: 'String', useNull: false}
	],

	subPreferences: [],

	proxy: Ext.create('proxy.preference', {reader: 'json'}),

	getResourceUrl: function() {
		return $AppConfig.Preferences.baseUrl;
	},

	save: function(ops) {
		var request, url = this.getResourceUrl();
		request = Ext.apply({
			url: url,
			method: 'PUT',
			jsonData: this.asJSON()
		}, ops);

		Ext.Ajax.request(request);
	}

}, function() {
	this.borrow(NextThought.model.Base, ['asJSON']);
});
