Ext.define('NextThought.app.account.identity.components.MenuItem', {
	extend: 'Ext.Component',
	alias: 'widget.account-menuitem',

	requires: ['NextThought.app.account.settings.Window'],

	mixins: {
		eableProfiles: 'NextThought.mixins.ProfileLinks'
	},

	cls: 'account-menu-item',

	renderTpl: Ext.DomHelper.markup([
		'{user:avatar}',
		{cls: 'content', cn: [
			{cls: 'username', html: '{user:displayName}'},
			{cls: 'links', cn: [
				{cls: 'profile', html: '{{{NextThought.view.account.MenuItem.profile}}}'},
				{cls: 'account', html: '{{{NextThought.view.account.MenuItem.account}}}'}
			]}
		]}
	]),


	renderSelectors: {
		avatarEl: '.avatar',
		nameEl: '.username',
		profileEl: '.content .links .profile',
		accountEl: '.content .links .account'
	},


	listeners: {
		accountEl: {
			'click': 'showAccount'
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		this.renderData = Ext.apply(this.renderData || {}, {user: $AppConfig.userObject});
		this.monitorUser($AppConfig.userObject);
	},


	monitorUser: function(user) {
		var me = this,
			m = {
				scope: this,
				destroyable: true,
				'changed': function(r) {
					var name = r.getName(),
						profile = me.avatarEl && me.avatarEl.down('.profile.avatar-pic');

					if (!me.avatarEl || !me.nameEl) { return; }

					if (profile) {
						profile.setStyle({backgroundImage: 'url(' + r.get('avatarURL') + ')'});
					}

					this.nameEl.update(name);

					me.monitorUser((r !== user) ? r : null);
				}
			};

		if (user) {
			Ext.destroy(me.userMonitor);
			me.userMonitor = me.mon(user, m);
			me.user = user;
		}
	},


	afterRender: function() {
		this.callParent(arguments);

		this.enableProfileClicks(this.profileEl);
	},


	showAccount: function() {
		var win = NextThought.app.account.settings.Window.create();

		win.show();
		win.center();
	}
});
