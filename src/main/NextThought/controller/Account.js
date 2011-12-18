Ext.define('NextThought.controller.Account', {
    extend: 'Ext.app.Controller',

    models: [
        'FriendsList',
        'UnresolvedFriend',
        'UserSearch',
        'User'
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
        },{});
    },


    accountActionButton: function(btn){
        var me = this,
			win = btn.up('fullscreen-window'),
            form= win.down('account-form'),
            values = form.getForm().getFieldValues(false),
			u = _AppConfig.userObject,
			fire = false,
			key;

		function callback(record, op){
			win.close();
			if(!op.success){
				console.error('FAILURE:',arguments);
			}
			else if(fire){
				me.getSessionInfo().fireEvent('password-changed',
						u.get('Username'),values.password);
			}
		}

        if(btn.actionName!='save'){
            win.close();
            return;
        }

        if(!form.getForm().isValid()){
            return;
        }

        if(values.password){
            fire = true;
            u.fields.add(new Ext.data.Field({name: 'password', type:'string'}));
        }
        for(key in values){
            if(!values.hasOwnProperty(key)) continue;
            u.set(key, values[key]);
        }
        u.save({callback: callback});
    },


    popoverNotifications: function() {
        var u = _AppConfig.userObject,
            popover = Ext.create('window.notifications-popover', {bindTo: this.getSessionInfo()});
        popover.show();

        u.set('lastLoginTime', new Date());
        u.save({
			callback: function(newRecord, op){
				if(!op.success){
					console.warn('FAILED: Saving user', op);
				}
			}
		});
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
