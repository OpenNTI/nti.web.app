Ext.define('NextThought.view.windows.ChatWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.chat-window',
    requires: [
        'Ext.button.Split',
        'Ext.tab.Panel',
        'NextThought.view.widgets.chat.View',
        'NextThought.view.widgets.chat.Friends'
    ],

    width: 700,
    height: 350,
    closeAction: 'hide',
    maximizable:true,
	constrain: true,
    title: 'Chat',
    layout: 'border',
    cls: 'chat-window',

    dockedItems:[{
        dock: 'bottom',
        xtype: 'toolbar',
        items:[
            {
                iconCls: 'flag',
                disabled: true,
                menu: [],
                action: 'flagged',
                xtype: 'splitbutton',
                tooltip:'flagged messages'
            }//,
            //{text:'whispers'},
            //{text:'shadows'}
        ]
    }],

    items: [
        {
            region: 'center',
            xtype: 'tabpanel',
        //},
        items:
        {
            //region: 'east',
            //collapsible: true,
            //split: true,
            //width: 200,
            title: 'Friends',
            xtype: 'chat-friends-view'
        }
        }
],

    onMessage: function(msg, opts) {
        var r = msg.get('ContainerId'),
            moderated = !!('moderated' in opts);


        var tab = this.down('chat-view[roomId=' + r + ']'),
            mlog = tab ? tab.down('chat-log-view[moderated=true]') : null;

        if(!tab) {
            console.warn('message received for tab which no longer exists', msg, r, this.items);
            return;
        }

        this.down('tabpanel').setActiveTab(tab);
        tab.down('chat-log-view[moderated='+moderated+']').addMessage(msg);

        if(!moderated && mlog) {
            mlog.removeMessage(msg);
        }
    },

    addNewChat: function(roomInfo) {
        var id = roomInfo.getId(),
            tab = this.down('chat-view[roomId='+id+']');

        if (!tab) {
            tab = this.down('tabpanel').add(
                {
                    title: this._generateTabName(roomInfo),
                    xtype: 'chat-view',
                    roomId: id,
                    closable: true,
                    roomInfo: roomInfo
                }
            );
        }

        if (tab) {
            this.down('tabpanel').setActiveTab(tab);
        }
    },


    closeChat: function(roomInfo, disableExitRoom) {
        var id = roomInfo.getId(),
            tab = this.down('chat-view[roomId='+id+']');

        if (tab) {
            tab.disableExitRoom = disableExitRoom;
            tab.destroy(); //TODO: This causes the room to be left this receiving no more messages, we want to remove the tab, but not leave the room in this case (switch to classroom)
        }
    },

    _generateTabName: function(roomInfo) {
        var occs = roomInfo.get('Occupants'),
            numOccs = occs.length,
            result = [],
            max = 2;

        for (var i = 0; result.length<max && i < occs.length; i++) {
            var u =  NextThought.cache.UserRepository.getUser(occs[i]);

            if (u.getId() == _AppConfig.userObject.getId()) continue;

            result.push(u.get('alias') || u.get('Username'));
        }
        var left = occs.length - result.length - 1;

        return result.join(',')+(left ? '...' : '');
    }

});
