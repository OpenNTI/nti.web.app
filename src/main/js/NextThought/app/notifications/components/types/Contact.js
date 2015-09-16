Ext.define('NextThought.app.notifications.components.types.Contact', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-contact',

	statics: {
		keyVal: 'application/vnd.nextthought.user'
	},

	wording: 'added you as a contact'
});

// Ext.define('NextThought.app.notifications.components.types.Contact', {
// 	extend: 'NextThought.app.notifications.components.types.Base',
// 	alias: 'widget.notification-item-contact',
// 	keyVal: 'application/vnd.nextthought.user',

// 	wording: 'NextThought.view.account.notifications.types.Contact.wording',

// 	getDisplayTime: function(values) {
// 		var t = values.EventTime || values['Last Modified'];

// 		if (!t || t.getTime() === 0) {
// 			t = values.CreatedTime;
// 		}
// 		values.Time = t;
// 		return Ext.util.Format.date(t, 'c');
// 	},

// 	getDisplayName: function(values) {
// 		if (!values || !this.showCreator) { return ''; }

// 		return NTIFormat.displayName(values, 'You');
// 	},


// 	getIcon: function(values) {
// 		return (values && NTIFormat.avatar(values)) || '';
// 	},


// 	clicked: function(view, rec) {
// 		//TODO: figure out this click
// 	}
// });
