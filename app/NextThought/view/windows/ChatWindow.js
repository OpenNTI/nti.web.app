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

    onMessage: function(msg) {
        var rooms = msg.get('rooms');
        Ext.each(rooms, function(r) {
            var tab = this.down('chat-view[roomid=' + r + ']');

            if(!tab) {
                console.log('WARNING: message received for tab which no longer exists', msg, r, this.items);
                return;
            }

            this.down('tabpanel').setActiveTab(tab);
            tsab.down('chat-log-view').addMessage(msg);
        }, this);
        
    },

    addNewChat: function(roomInfo) {
        var id = roomInfo.getId(),
            tab = this.down('chat-view[roomid='+id+']');

        if (tab) {
            //tab already exists,
            this.setActiveTab(tab);
            return;
        }

        this.down('tabpanel').add(
            {
                title: this._generateTabName(roomInfo),
                xtype: 'chat-view',
                roomid: id,
                closable: true,
                roomInfo: roomInfo
            }
        );
    },

    _generateTabName: function(roomInfo) {
        var occs = roomInfo.get('Occupants'),
            numOccs = occs.length,
            result = '',
            max = 2;

        Ext.each(occs, function(o, i){
            if ((i+1) > max) {
                result + ', ' + numOccs - max + ' more.';
                return false;
            }

            if (i != 0) result += ', ';
            var u = UserDataLoader.resolveUser(o); //TODO - do this here?
            result += u.get('alias') || u.get('Username');

        }, this);

        return result;
    }

});