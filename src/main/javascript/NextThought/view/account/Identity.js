//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity',{
	extend: 'Ext.Component',
	alias: 'widget.identity',

    requires: [
        'NextThought.view.menus.Settings'
    ],
	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks'
	},

	cls: 'identity',

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'img', src: '{avatarURL}', cls: 'avatar'},
        { tag: 'div', cls: 'menu', 'data-qtip': 'Settings'},
		{
			cls: 'wrap',
			cn: [{
				cls: 'name', html: '{displayName}'
			},{
				cls: 'status', html: '{status}'
			}]
		}
	]),

	renderSelectors: {
		notificationCount: 'span.notifications',
		name: 'div.name',
        menuBtn: 'div.menu',
		status: 'div.status',
		avatar: 'img.avatar'
	},

	initComponent: function(){
		var me = this;

		me.callParent(arguments);

		me.renderData = Ext.apply(me.renderData||{}, $AppConfig.userObject.data);

		this.menu = Ext.widget('settings-menu');

		this.monitorUser($AppConfig.userObject);
	},


	monitorUser: function(u){
		var me = this, m = {
			scope: this,
			'changed': function(r){
				this.name.update(r.getName());
				this.status.update(r.get('status'));
				this.avatar.set({src:r.get('avatarURL')});
				if(r !== u){
					me.monitorUser(r);
				}
			}
		};

		this.mun(this.user,m);
		this.mon(u,m);
		this.user = u;
	},


    afterRender: function(){
		var me = this;
        me.callParent(arguments);
        me.mon(me.menuBtn, 'click', function(e){
            me.menu.showBy(me.menuBtn);
	        e.stopEvent();
	        return false;
        });

	    me.enableProfileClicks(me.avatar,me.name);
    }
});
