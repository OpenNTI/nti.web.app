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
            prevGroups = Ext.Array.clone(me._groups) || [];



        Ext.each(groups, function(g){
            if(/everyone/i.test(g.get('id'))) return; //skip everyone group
            var groupPanel = me.down('panel[groupId='+g.getId()+']');
            if(!groupPanel){
                groupPanel = me.add({
                    title: g.get('realname'),
                    collapsible: true,
                    collapseFirst: false,
                    groupId: g.getId(),
                    tools:[
                        {
                            type: 'gear',
                            tooltip: 'open chat for this group',
                            handler: function(){me.fireEvent('group-click', g)}
                        }
                    ]
                });
            }


            Ext.each(g.get('friends'), function(f){
                var item = groupPanel.down('chat-friend-entry[userId='+f.getId()+']');
                if(item){
                    item.update(f);
                    return;
                }
                groupPanel.add({
                    xtype: 'chat-friend-entry',
                    user: f,
                    userId: f.getId()
                });
            })
        });

        me._groups = groups;
    }
});