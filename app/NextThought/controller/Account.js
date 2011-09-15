Ext.define('NextThought.controller.Account', {
    extend: 'Ext.app.Controller',
    requires: [
        'NextThought.proxy.UserDataLoader'
    ],

    views: [
        'form.AccountForm',
        'windows.FullScreenFormWindow',
        'windows.NotificationsPopover',
        'widgets.main.SessionInfo',
        'widgets.main.Identity'
    ],

    refs: [
        { ref: 'sessionInfo', selector: 'session-info' },
        { ref: 'identity', selector: 'identity-panel' }
    ],

    init: function() {
        this.control({
            '#account-window button[actionName]':{
                'click': this.accountActionButton
            },

            'session-info': {
                'account': this.showAccount,
                'notification': this.popoverNotifications
            }
        });
    },


    accountActionButton: function(btn){
        var win = btn.up('fullscreen-window'),
            form= win.down('account-form'),
            values = form.getForm().getFieldValues();

        if(btn.actionName!='save'){
            win.close();
            return;
        }

        if(!form.getForm().isValid()){
            return;
        }

        var key,u = _AppConfig.server.userObject;
        for(key in values){
            if(!values.hasOwnProperty(key)) continue;
            u.set(key, values[key]);
        }
        u.save({
            scope: this,
            failure: function(){
                console.log('FAILURE:',arguments);
            },
			success:function(newRecord,operation){
                _AppConfig.server.userObject = newRecord;
                this.getIdentity().update(newRecord);
                win.close();
            }
        });
    },


    popoverNotifications: function() {
        var u = _AppConfig.server.userObject,
            popover = Ext.create('window.notifications-popover');
        popover.alignTo(this.getSessionInfo());
        popover.show();

        u.set('lastLoginTime', new Date());
        u.save();
    },


    showAccount: function(){
        Ext.create('widget.fullscreen-window',
            {
                id: 'account-window',
                items: {
                    xtype: 'account-form',
                    account: _AppConfig.server.userObject
                }
            }
        ).show();
    }
});