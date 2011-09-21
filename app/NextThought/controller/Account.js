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

        var fire = false,
            key,
            u = _AppConfig.userObject;
        if(values.password){
            fire = true;
            u.fields.add(new Ext.data.Field({name: 'password', type:'string'}));
        }
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
                _AppConfig.userObject = newRecord;
                this.getIdentity().update(newRecord);
                win.close();
                if(fire){
                    this.getSessionInfo().fireEvent('password-changed', u.get('Username'),values.password);
                }
            }
        });
    },


    popoverNotifications: function() {
        var u = _AppConfig.userObject,
            popover = Ext.create('window.notifications-popover', {bindTo: this.getSessionInfo()});
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
                    account: _AppConfig.userObject
                }
            }
        ).show();
    }
});