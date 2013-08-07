//SCSS defined _identity.scss
Ext.define('NextThought.view.account.Identity',{
	extend: 'Ext.Component',
	alias: 'widget.identity',

    requires: [
        'NextThought.view.menus.Settings',
        'NextThought.modules.TouchSender'
    ],
	mixins: {
		enableProfiles: 'NextThought.mixins.ProfileLinks',
        moduleContainer: 'NextThought.mixins.ModuleContainer'
	},

	profileLinkCard: false,

	cls: 'identity',
	autoShow: true,
	floating: true,

	renderTpl: Ext.DomHelper.markup([
		{ tag: 'img', src: '{avatarURL}', cls: 'avatar', 'data-qtip':'{displayName}'},
		{ cls: 'presence' }
	]),

	renderSelectors: {
		avatar: 'img.avatar',
		presence: '.presence'
	},

    menuOpen: false,

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData||{}, $AppConfig.userObject.data);
		this.menu = Ext.widget({xtype:'settings-menu'});
		this.on('destroy','destroy',this.menu);
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

				me.monitorUser((r !== u) ? r : null);
			}
		};

		if( u ){
			me.mun(me.user,m);
			me.mon(u,m);
			me.user = u;
		}

		if( me.presence && me.user ){
			me.presence.set({cls:'presence '+ me.user.getPresence().getName()});
		}
	},


    afterRender: function(){
	    this.callParent(arguments);
	    this.monitorUser(this.user);
        this.mon(this.el, {
	        'mouseover':'startToShowMenu',
	        'mouseout':'startToHideMenu'
        });

	    this.mon(this.menu,'mouseenter','cancelHideShowEvents');

	    this.enableProfileClicks(this.avatar);

        if(Ext.is.iPad){
            this.setupTouch();
        }
    },

    setupTouch: function(){
        this.buildModule('modules', 'touchSender');

        var container = this;

        container.on('touchTap', function(ele) {
            console.log('TOUCHTAPPED');
            ele.click();
        });

        container.on('touchElementAt', function(x, y, callback){
            var element = Ext.getDoc().dom.elementFromPoint(x, y);
            callback(element);
        });

        container.on('touchLongPress', function(ele, pageX, pageY){
            console.log("LONG PRESS");
            if(this.menuOpen){
                this.menuOpen = false;
                this.startToHideMenu();
            }
            else{
                this.menuOpen = true;
                this.startToShowMenu();
            }
        });


    },

	cancelHideShowEvents: function(){
		clearTimeout(this.showTimout);
		clearTimeout(this.hideTimout);
	},


	startToShowMenu: function(){
        console.log("startToShowMenu");
		var me = this;

		this.cancelHideShowEvents();

		this.showTimout = setTimeout(function(){
	        me.menu.showBy(me.el, 'tr-br', [0,0]);
		},500);
    },


	startToHideMenu: function(){
        console.log("startToHideMenu");
		var me = this;

		this.cancelHideShowEvents();

		this.hideTimout = setTimeout(function(){
	        me.menu.hide();
		},500);
    }
});
