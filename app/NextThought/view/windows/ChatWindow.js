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
        var rooms = msg.get('rooms'),
            moderated = !!('moderated' in opts);
            
        Ext.each(rooms, function(r) {
            var tab = this.down('chat-view[roomId=' + r + ']'),
                mlog = tab ? tab.down('chat-log-view[moderated=true]') : null;

            if(!tab) {
                console.log('WARNING: message received for tab which no longer exists', msg, r, this.items);
                return;
            }

            this.down('tabpanel').setActiveTab(tab);
            tab.down('chat-log-view[moderated='+moderated+']').addMessage(msg);

            if(!moderated && mlog) {
                mlog.removeMessage(msg);
            }
        }, this);
        
    },

    addNewChat: function(roomInfo) {
        var id = roomInfo.getId(),
            ocs = roomInfo.get('Occupants'),
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