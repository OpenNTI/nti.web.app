const Ext = require('extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.model.preference.PushNotifications', {
	extend: 'NextThought.model.preference.Base',

	fields: [
		{name: 'Email', type: 'Future'},
		{name: 'send_me_push_notifications', type: 'string'}
	],

	subPreferences: ['Email'],

	getResourceUrl: function () {
		return this.callParent(arguments) + '/PushNotifications';
	}
});
