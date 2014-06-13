Ext.define('NextThought.view.account.notifications.types.Badge', {
	extend: 'NextThought.view.account.notifications.types.Base',
	alias: 'widget.notification-item-badge',
	keyVal: 'application/vnd.nextthought.openbadges.badge',

	showCreator: false,
	itemCls: 'badge',
	wording: 'NextThought.view.account.notifications.types.Badge.wording',

	emptyTpl: '',

	badgeTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'link', html: '{name}'}).compile(),

	fillInData: function(rec, wrap) {
		if (!rec.fields.getByKey('EventTime')) {
			rec.fields.add(Ext.data.Field.create({name: 'EventTime', type: 'date'}));
		}

		rec.set({EventTime: wrap.get('Last Modified')});
	},

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
	}
});
