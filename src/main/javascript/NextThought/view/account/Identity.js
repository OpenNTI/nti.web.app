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
		{ tag: 'img', src: '{avatarURL}', cls: 'avatar', 'data-qtip':'{displayName}'},
		{ cls: 'presence' }
	]),

	renderSelectors: {
		avatar: 'img.avatar',
		presence: '.presence'
	},

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{}, $AppConfig.userObject.data);
		this.menu = Ext.widget('settings-menu');
		this.monitorUser($AppConfig.userObject);
	},


	monitorUser: function(u){
		var me = this, m = {
			scope: this,
			'changed': function(r){
				me.avatar.set({
					src:r.get('avatarURL'),
					'data-qtip': r.getName()
				});

				me.presence.set({cls:'presence '+ r.getPresence().getName()});

				if(r !== u){
					me.monitorUser(r);
				}
			}
		};

		me.mun(me.user,m);
		me.mon(u,m);
		me.user = u;
	},


    afterRender: function(){
		var me = this,
			el = me.el;

	    me.callParent(arguments);

        me.mon(el, 'mouseover', function(){
            me.menu.showBy(el, 'tr-br', [0,0]);
        });

        me.menu.setWidth(me.el.up('.sidebar').getWidth());

	    me.enableProfileClicks(me.avatar);
    }
});
