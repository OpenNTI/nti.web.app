/*
To look like this:
    '<div style="float: right;  white-space: nowrap; margin-right: 5px">',
        '<span style="padding: 5px; padding-top: 6px;font-size: 12px; vertical-align: middle; cursor: pointer;">'+n+'</span> ',
        ' <span style="width: 24px; height: 23px; padding-top: 2px; display: inline-block; text-align: center; cursor: pointer; vertical-align: middle;margin-top: 2px; background: url(\'resources/images/notify.png\') no-repeat -25px 0px;">0</span> ',
        ' <img src="'+a+'" width=24 height=24 valign=middle> ',
        ' <img src="resources/images/gear.png" width=19 height=19 valign=middle>',
    '</div>'
 */

Ext.define('NextThought.view.widgets.SessionInfo', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.session-info',

    cls: 'x-session-controls',

    width: MIN_SIDE_WIDTH,
    height: 25,
    border: false,
    layout: {type:'hbox', pack: 'end'},
    defaults: {
        height: 25,
        border: false
    },
    _stream: [],

    initComponent: function() {
        this.callParent(arguments);

        var me = this,
            u = _AppConfig.server.userObject,
    		n = u.get('realname'),
    		a = u.get('avatarURL'),
            c = _AppConfig.server.userObject.get('notificationsLastRead');


        me._menu = Ext.create('Ext.menu.Menu', {items: me._buildMenu()});
        me._menu.on('mouseleave', me._hideMenu, this);


        me.add({cls: 'x-username', username: true,
            html: '<span>'+n+'</span><img src="'+a+'" width=24 height=24 valign=middle>' });

        me.add({html: '<span class="notification-box-widget"></span>', notification: true});

        me.add({  xtype: 'image', src:'resources/images/gear.png',
                    height: 26, width: 26, margin: '0 3px 0 0', settings: true});

        // Start a simple clock task that updates a div once per second
		me._task = {
		    run: function(){
		    	 UserDataLoader.resolveUser(u.get('Username'),
		        	function(user){
                        var key = 'NotificationCount';

                        if (user) u.set(key, user.get(key));

                        me.update();
		        	},
                     true // force resolve
		        );
		    },
		    scope: this,
		    interval: 30000//30 sec
		}
    },

    update: function() {
        var u = _AppConfig.server.userObject,
            l = u.get('NotificationCount'),
            e = this.down('panel[notification]').el.down('span'),
            clsName = 'unread';

        //set unread class
        if (l) e.addCls(clsName);
        else e.removeCls(clsName);

//        (l?e.addCls:e.removeCls).apply(e, clsName);

        e.dom.innerHTML = l > 99 ? '++' : l;

    },

    render: function(){
        this.callParent(arguments);
        this.down('panel[username]').el.on('mouseover', this._mouseOverUsername, this);
        //this.down('image[settings]').el.on('click', this._click, this);

        //start the task to check for notifications
        Ext.TaskManager.start(this._task);
    },


    _buildMenu: function(){
        return [
            {
                text: 'Logout',
                scope: this,
                handler: this._click
            }
        ];
    },

    _hideMenu: function(){
        var m = this._menu;
        setTimeout(function(){m.hide()},10);
    },

    _mouseOverUsername: function(){
        this._menu.showBy(
            this.down('panel[username]').el);
    },

    _click: function(){
        this.fireEvent('logout');
    }
});