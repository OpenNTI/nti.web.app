/*
 * This controller should only contain generic application controls. (Such as loading & setting up state or centralized
 * objects; see librarySource)
 */
Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',
    requires: ['NextThought.proxy.UserDataLoader'],

    views: [
        'Viewport',
        'widgets.main.SessionInfo',
        'windows.NotificationsPopover'
    ],

    refs: [
        {
            ref: 'viewport',
            selector: 'master-view'
        },{
            ref: 'sessionInfo',
            selector: 'session-info'
        }
    ],

    init: function() {
        var me = this,
            l = NextThought.librarySource = Ext.create('NextThought.Library');
        l.on('loaded', function(){
                var b = l._library.titles[0];
                me.getViewport().fireEvent('navigate',b, b.root+'sect0001.html');
            });


        this.control({
            'session-info': {
                'notification-clicked': this.popoverNotifications
            }
        });
    },


    popoverNotifications: function() {

        var popover = Ext.create('window.notifications-popover');

        popover.alignTo(this.getSessionInfo());
        popover.show();
    }
});