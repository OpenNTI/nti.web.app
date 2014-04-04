Ext.define('NextThought.view.account.notifications.types.Contact', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-contact',
	keyVal: 'application/vnd.nextthought.user',

	requires: [
		'NextThought.view.account.contacts.management.Popout'
	],

	verb: 'added you as a contact.',

	fillInData: function(rec) {
	},


	getDisplayName: function(values) {
		if (!values || !this.showCreator) { return ''; }
		return NTIFormat.displayName(values, 'You');
	},


	getIcon: function(values) {
		return (values && ('url(' + NTIFormat.avatarURL(values) + ')')) || '';
	},


	clicked: function(view, rec) {
		view.fireEvent('show-profile', rec);
	}
});
