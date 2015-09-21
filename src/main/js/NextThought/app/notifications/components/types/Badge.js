Ext.define('NextThought.app.notifications.components.types.Badge', {
	extend: 'NextThought.app.notifications.components.types.Base',
	alias: 'widget.notifications-item-badge',

	statics: {
		keyVal: 'application/vnd.nextthought.openbadges.badge'
	},

	showCreator: false,
	itemCls: 'badge',
	wording: 'awarded you {badge}',

	fillInData: function() {
		var me = this,
			creator = Service.get('SiteCommunity');

		UserRepository.getUser(creator)
			.then(function(user) {
				me.iconEl.update(NTIFormat.avatar(user));
				me.usernameEl.update(user.getName());
			});
	},


	fillInWording: function() {
		var wording = this.wording;

		wording = wording.replace('{badge}', this.titleTpl.apply({name: this.record.get('name')}));

		this.wordingEl.dom.innerHTML = wording;
	},


	getDisplayTime: function() {
		var t = this.record.get('EventTime') || this.record.get('Last Modified');

		return t;
	}
});
