const Ext = require('@nti/extjs');

require('../Base');


module.exports = exports = Ext.define('NextThought.model.preference.pushnotifications.Base', {
	extend: 'NextThought.model.preference.Base',

	getResourceUrl: function () {
		return this.callParent(arguments) + '/PushNotifications';
	}
});
