Ext.define('NextThought.view.account.notifications.types.Contact', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-contact',
	keyVal: 'application/vnd.nextthought.user',

	requires: [
		'NextThought.view.account.contacts.management.Popout'
	],

	wording: 'NextThought.view.account.notifications.types.Contact.wording',

	getDisplayTime: function(values) {
		var t = values.EventTime || values['Last Modified'];

		if (!t || t.getTime() === 0) {
			t = values.CreatedTime;
		}
		values.Time = t;
		return Ext.util.Format.date(t, 'c');
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
