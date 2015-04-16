Ext.define('NextThought.model.preference.ChatPresence', {
	extend: 'NextThought.model.preference.Base',

	fields: [
		{name: 'Active', type: 'Future'},
		{name: 'Available', type: 'Future'},
		{name: 'Away', type: 'Future'},
		{name: 'DND', type: 'Future'}
	],

	subPreferences: ['Active', 'Available', 'Away', 'DND'],

	getResourceUrl: function() {
		var base = this.callParent(arguments);

		return base + '/ChatPresence';
	}
});
