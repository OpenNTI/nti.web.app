Ext.define('NextThought.view.account.MenuItem',{
	extend: 'Ext.Component',
	alias: 'widget.account-menuitem',

	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks'
	},

	cls: 'account-menu-item',

	renderTpl: Ext.DomHelper.markup([
			{ style: { backgroundImage: "url({avatarURL})"}, cls: 'avatar', 'data-qtip': '{displayName:htmlEncode}' },
			{ cls: 'content', cn: [
				{ cls: 'username', html: '{displayName:htmlEncode}' },
				{ cls: 'links', cn: [
					{ cls: 'profile', html: 'View Profile' },
					{ cls: 'account', html: 'Manage Account'}
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


	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, $AppConfig.userObject.data);
		this.monitorUser($AppConfig.userObject);
	},


	monitorUser: function(user){
		var me = this, m ={
			scope: this,
			destroyable: true,
			'changed': function(r){
				var name = r.getName();

				if(!me.avatarEl || !me.nameEl){ return; }

				me.avatarEl.set({src: r.get('avatarUrl'), 'data-qtip': name});
				me.nameEl.update(name);

				me.monitorUser((r !== user)? r : null );
			}
		}

		if(user){
			Ext.destroy(me.userMonitor);
			me.userMonitor = me.mon(user, m);
			me.user = user;
		}
	},


	afterRender: function(){
		this.callParent(arguments);

		this.enableProfileClicks(this.profileEl);
	},


	showAccount: function(){
		this.fireEvent('show-account');
	}
});