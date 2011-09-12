Ext.define('NextThought.controller.Account', {
    extend: 'Ext.app.Controller',
    requires: [
        'NextThought.proxy.UserDataLoader'
    ],

    views: [
        'windows.Account',
        'windows.NotificationsPopover',
        'widgets.main.SessionInfo'
    ],

    refs: [
        { ref: 'sessionInfo',     selector: 'session-info' }
    ],

    init: function() {
        this.control({
            'account-window button[actionName]':{
                'click': this.accountActionButton
            },

            'session-info': {
                'account': this.showAccount,
                'notification': this.popoverNotifications
            }
        });
    },


    accountActionButton: function(btn){
        var win = btn.up('account-window'),
            form= win.down('form');

        win.close();
    },


    popoverNotifications: function() {

        var popover = Ext.create('window.notifications-popover');

        popover.alignTo(this.getSessionInfo());
        popover.show();
    },


    showAccount: function(){
        Ext.create('widget.account-window').show();
    }
});