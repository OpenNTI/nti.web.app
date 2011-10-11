Ext.define('NextThought.view.widgets.chat.Friends', {
    extend:'Ext.panel.Panel',
    alias: 'widget.chat-friends-view',

    requires: [
        'NextThought.view.widgets.chat.FriendEntry'
    ],

    autoScroll: true,
    layout: 'anchor',
    border: false,
    defaults: {border: false, defaults: {border: false}},

    initComponent:function() {
        this.callParent(arguments);
        this.setGroups();
        UserDataLoader.getFriendsListsStore().on('load', this.reload, this);
    },

    reload: function(store, groups, success, ops) {
        this.setGroups();
    },

    setGroups: function() {
        var me = this,
            groups = UserDataLoader.getFriendsListsStore(),
            prevGroups = me._groups || {},
            newGroups = {};



        groups.each(function(g){
            if(/everyone/i.test(g.get('id'))) return; //skip everyone group

            var gid = g.getId(),
                groupPanel = me.down('panel[groupId='+gid+']');

            if(!groupPanel){
                groupPanel = me.add({
                    title: g.get('realname'),
                    collapsible: true,
                    collapseFirst: false,
                    groupId: gid,
                    friends: {},
                    tools:[
                        {
                            type: 'gear',
                            tooltip: 'open chat for this group',
                            handler: function(){me.fireEvent('group-click', g)}
                        }
                    ]
                });
            }

            newGroups[gid] = groupPanel;
            delete prevGroups[gid];

            var prevFriends = groupPanel.friends, newFriends = {};

            Ext.each(g.get('friends'), function(uid){
                var friend = UserRepository.getUser(uid);

                var item = groupPanel.down('chat-friend-entry[userId='+uid+']');
                if(item){
                    item.update(friend);
                }
                else {
                    item = groupPanel.add({
                        xtype: 'chat-friend-entry',
                        user: friend,
                        userId: uid,
                        noMenu: true
                    });
                }

                newFriends[uid] = item;
                delete prevFriends[uid];
            });

            clean(prevFriends, newFriends, groupPanel, 'friends');

        });

        clean(prevGroups, newGroups, me, '_groups');


        function clean(dirty, clean, obj, key){
            obj[key] = clean;
            for(var k in dirty){
                obj.remove(dirty[k]);
                delete dirty[k];
            }
        }
    }
});