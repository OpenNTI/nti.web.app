/*
 To look like this:
 '<div style="float: right;  white-space: nowrap; margin-right: 5px">',
 '<span style="padding: 5px; padding-top: 6px;font-size: 12px; vertical-align: middle; cursor: pointer;">'+n+'</span> ',
 ' <span style="width: 24px; height: 23px; padding-top: 2px; display: inline-block; text-align: center; cursor: pointer; vertical-align: middle;margin-top: 2px; background: url(\'resources/images/notify.png\') no-repeat -25px 0px;">0</span> ',
 ' <img src="'+a+'" width=24 height=24 valign=middle> ',
 ' <img src="resources/images/gear.png" width=19 height=19 valign=middle>',
 '</div>'
 */

Ext.define('NextThought.view.widgets.main.SessionInfo', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.session-info',
    requires: [
        'NextThought.view.widgets.main.Identity'
    ],

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

        var me = this;

        me._menu = Ext.create('Ext.menu.Menu', {items: me._buildMenu()});
        me._menu.on('mouseleave', me._hideMenu, this);


        me.add({xtype: 'identity-panel'}).on('mouseover', this._mouseOverUsername, this);

        this._notifications = me.add({html: '<span class="notification-box-widget"></span>'});

        me._task = {
            run: function(){
                UserDataLoader.resolveUser(_AppConfig.server.userObject.get('Username'),
                    function(user){
                        if (user)
                            me.update(user.get('NotificationCount'));
                        else
                            Ext.TaskManager.stop(me._task);
                    },
                    true // force resolve
                );
            },
            scope: this,
            interval: 30000//30 sec
        }
    },

    update: function(c) {
        var e = this._notifications.el.down('span'),
            clsName = 'unread';

        //set unread class
        (c?e.addCls:e.removeCls).call(e, clsName);

        e.dom.innerHTML = c > 99 ? '++' : c;
    },

    clearNotifications: function() {
        var e = this._notifications.el.down('span');
        e.removeCls('unread');
        e.dom.innerHTML = 0;
    },

    render: function(){
        this.callParent(arguments);

        this._notifications.el.on('click', this._notifications, this);
        //start the task to check for notifications
        Ext.TaskManager.start(this._task);
    },

    _buildMenu: function(){
        return [
            {
                text: 'Account',
                scope: this,
                handler: this._account
            },{
                text: 'Settings',
                scope: this,
                iconCls: 'settings-gear',
                handler: this._settings
            },'-',
            {
                text: 'Logout',
                scope: this,
                handler: this._logout
            }
        ];
    },

    _hideMenu: function(){
        var m = this._menu;
        setTimeout(function(){m.hide()},10);
    },

    _mouseOverUsername: function(){
        this._menu.showBy(this.down('identity-panel').el);
    },

    _account: function(){
        this.fireEvent('account');
    },

    _logout: function(){
        this.fireEvent('logout');
    },

    _notifications: function() {
        this.clearNotifications();
        this.fireEvent('notification');
    },

    _settings: function(){
        this.fireEvent('settings');
    }
});