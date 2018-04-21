const Ext = require('@nti/extjs');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.notifications.components.types.Contact', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-contact',

	statics: {
		mimeType: 'application/vnd.nextthought.user'
	},

	wording: 'added you as a contact'
});
