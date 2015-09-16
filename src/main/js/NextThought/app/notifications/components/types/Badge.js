Ext.define('NextThought.app.notifications.components.types.Badge', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-badge',

	statics: {
		keyVal: 'application/vnd.nextthought.openbadges.badge'
	},

	showCreator: false,
	itemCls: 'badge',
	wording: 'awarded you a badge: {badge}',

	fillInData: function() {
		var img = this.item.get('image');

		this.iconEl.innerHTML = Ext.DomHelper.markup({
			cls: 'icon',
			style: {backgroundImage: 'url(' + img + ')'}
		});
	},


	fillInWording: function() {
		var wording = this.wording;

		wording = wording.replace('{badge}', this.titleTpl.apply({name: this.item.get('name')}));

		this.wordingEl.innerHTML = wording;
	},


	getDisplayTime: function() {
		var t = this.item.get('EventTime') || this.item.get('Last Modified');

		return t;
	}
});

// Ext.define('NextThought.app.notifications.components.types.Badge', {
// 	extend: 'NextThought.app.notifications.components.types.Base',
// 	alias: 'widget.notification-item-badge',
// 	keyVal: 'application/vnd.nextthought.openbadges.badge',

// 	showCreator: false,
// 	itemCls: 'badge',
// 	wording: 'NextThought.view.account.notifications.types.Badge.wording',

// 	emptyTpl: '',

// 	badgeTpl: Ext.DomHelper.createTemplate({tag: 'span', cls: 'link', html: '{name}'}).compile(),

// 	getWording: function(values) {
// 		var name;

// 		if (values.isEmpty) {
// 			name = this.emptyTpl;
// 		} else {
// 			name = this.badgeTpl.apply({name: values.name});
// 		}

// 		return getFormattedString(this.wording, {
// 			badge: name
// 		});
// 	},

// 	getIcon: function(values) {
// 		return Ext.DomHelper.markup({cls: 'icon', style: {backgroundImage: 'url(' + values.image + ')'}});
// 	},

// 	clicked: function(view, rec) {
// 		//TODO: figure out this navigation
// 	},


// 	getDisplayTime: function(values) {
// 		var t = values.EventTime || values.CreatedTime;

// 		values.Time = t;
// 		return Ext.util.Format.date(t, 'c');
// 	}
// });
