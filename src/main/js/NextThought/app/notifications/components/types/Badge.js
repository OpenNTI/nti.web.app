Ext.define('NextThought.app.notifications.components.types.Badge', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notification-item-badge',
	keyVal: 'application/vnd.nextthought.openbadges.badge',

	showCreator: false,
	itemCls: 'badge',
	wording: 'NextThought.view.account.notifications.types.Badge.wording',

	emptyTpl: '',

	badgeTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'link', html: '{name}'}).compile(),

	getWording: function(values) {
		var name;

		if (values.isEmpty) {
			name = this.emptyTpl;
		} else {
			name = this.badgeTpl.apply({name: values.name});
		}

		return getFormattedString(this.wording, {
			badge: name
		});
	},

	getIcon: function(values) {
		return 'url(' + values.image + ')';
	},

	clicked: function(view, rec) {
		view.fireEvent('show-profile', $AppConfig.userObject, ['Achievements']);
	},


	getDisplayTime: function(values) {
		var t = values.EventTime || values.CreatedTime;

		values.Time = t;
		return Ext.util.Format.date(t, 'c');
	}
});
