Ext.define('NextThought.view.windows.ChatWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.chat-window',
    requires: [
        'NextThought.view.widgets.chat.View',
        'NextThought.view.widgets.chat.Friends'
    ],

    width: 500,
    height: 350,
    maximizable:true,
    title: 'Chat',
    layout: 'border',

//    dockedItems:[{
//        docked: 'top',
//        xtype: 'toolbar',
//        items:['->',{text:'hi'}]
//    }],

    items: [
        {
            region: 'center',
            xtype: 'tabpanel'
        },
        {
            region: 'east',
//            collapsible: true,
            frame: false,
            split: true,
            width: 200,
            layout: 'accordion',
            items: [
//                {
//                    title: 'Tools'
//                },
                {
                    title: 'Friends',
                    xtype: 'chat-friends-view'
                }
            ]
        }
    ],

    addNewChat: function(roomInfo) {
        var id = roomInfo.getId(),
            tab = this.down('tab[roomid='+id+']');

        if (tab) {
            //tab already exists,
            this.setActiveTab(tab);
            return;
        }

        this.down('tabpanel').add(
            {
                title: id,
                xtype: 'chat-view',
                roomid: id,
                closable: true,
                roomInfo: roomInfo
            }
        );
    }

});