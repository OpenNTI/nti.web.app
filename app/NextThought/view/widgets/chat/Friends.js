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
        console.log('friends view init');
    },

    setGroups: function(groups) {
        var me = this;

        Ext.each(groups, function(g){
            if(/everyone/i.test(g.get('id'))) return; //skip everyone group
            var groupPanel = me.add({
                title: g.get('realname'),
                collapsible: true
            });
            Ext.each(g.get('friends'), function(f){
                groupPanel.add({
                    xtype: 'chat-friend-entry',
                    user: f
                });
            })
        });
        console.log('set groups', groups);
    }
});