Ext.define('NextThought.view.widgets.chat.OccupantsList', {
    extend:'Ext.panel.Panel',
    alias: 'widget.chat-occupants-list',

    requires: [
        'NextThought.view.widgets.chat.FriendEntry'
    ],

    width: 125,
    collapsible: true,
    collapseFirst: false,
    autoScroll: true,
    layout: 'anchor',
    border: false,
    title: 'Chat Room',

    defaults: {border: false, defaults: {border: false}},

    initComponent:function() {
        var me = this;

        me.tools = [{
            type: 'gear',
            tooltip: 'become moderator',
            handler: function(){me.fireEvent('moderate-tool-clicked', me)}
        }];

        me.callParent(arguments);
    },

    setOccupants: function(a) {
        var me = this,
            total = a.length,
            numberOccupants = 0;

        me.removeAll();
        
        Ext.each(a,
            function(username){
                NextThought.cache.UserRepository.prefetchUser(username, function(users){
                    var u = users[0];
                    if (!u) {
                        console.log('ERROR, could not resolve user', username);
                    }
                    else {
                        me.add({
                            xtype: 'chat-friend-entry',
                            user: u,
                            userId: u.getId()
                        });
                    }

                    if (!u || u.getId() != _AppConfig.userObject.getId())
                        numberOccupants++;

                    total--;
                    if (total <= 0) finish();
                });
            });

        function finish() {
            if (numberOccupants <= 1) {
                //just me and someone else here
                me.close();
            }
        }

    }
});