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

	profileLinkCard: false,

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
	    this.callParent(arguments);

        this.mon(this.el, {
	        'mouseover':'startToShowMenu',
	        'mouseout':'startToHideMenu'
        });

	    this.mon(this.menu,'mouseenter','cancelHideShowEvents');

        this.menu.setWidth(this.el.up('.sidebar').getWidth());

	    this.enableProfileClicks(this.avatar);
    },


	cancelHideShowEvents: function(){
		clearTimeout(this.showTimout);
		clearTimeout(this.hideTimout);
	},


	startToShowMenu: function(){
		var me = this;

		this.cancelHideShowEvents();

		this.showTimout = setTimeout(function(){
	        me.menu.showBy(me.el, 'tr-br', [0,0]);
		},500);
    },


	startToHideMenu: function(){
		var me = this;

		this.cancelHideShowEvents();

		this.hideTimout = setTimeout(function(){
	        me.menu.hide();
		},500);
    }
});
