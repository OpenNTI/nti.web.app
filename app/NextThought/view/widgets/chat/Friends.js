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
    },

    setGroups: function(groups) {
        var me = this,
            prevGroups = me._groups || {},
            newGroups = {};



        Ext.each(groups, function(g){
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

            var prevFriends = groupPanel.friends, newFriends = {}, uid;

            Ext.each(g.get('friends'), function(f){
                uid = f.getId();
                var item = groupPanel.down('chat-friend-entry[userId='+uid+']');
                if(item){
                    item.update(f);
                }
                else {
                    item = groupPanel.add({
                        xtype: 'chat-friend-entry',
                        user: f,
                        userId: uid
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