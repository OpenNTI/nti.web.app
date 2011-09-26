Ext.define('NextThought.controller.Chat', {
    extend: 'Ext.app.Controller',
    requires: [
        'NextThought.proxy.UserDataLoader',
        'NextThought.proxy.Socket'
    ],

    views: [
        'windows.ChatWindow',
        'widgets.chat.View',
        'widgets.chat.Log',
        'widgets.chat.Friends',
        'widgets.chat.FriendEntry'
    ],

    refs: [
        { ref: 'chatWindow', selector: 'chat-window'}
    ],

    activeRooms: {},


    init: function() {
        var me = this;

        Socket.register({
            'chat_enteredRoom': function(){me.enteredRoom.apply(me, arguments)},
            'chat_recvMessage': function(){me.onMessage.apply(me, arguments)},
            'chat_recvMessageForModeration': function(){me.onModeratedMessage.apply(me, arguments);},
            'chat_presenceOfUserChangedTo': function(user, presence){UserRepository._presenceChanged(user, presence);}
        });


        this.control({
            'leftColumn button[showChat]':{
                'click': this.openChatWindow
            },

            'chat-friends-view' : {
                'group-click': this.groupEntryClicked
            },

            'chat-friend-entry' : {
                click : this.friendEntryClicked
            },

            'chat-view':{
                'beforedestroy': function(cmp){
                    this.leaveRoom(cmp.roomInfo);
                }
            },

            'chat-log-view':{'approve': function(ids){this.approveMessages(ids)}},
            'chat-log-view button[action]':{'click': this.toolClicked},
            'chat-log-view tool[action]':{'click': this.toolClicked},

            'chat-view textfield' : {
                'specialkey' : function(f, e) {
                    if (e.getKey() != e.ENTER) return;
                    this.postMessage(f.up('chat-view').roomInfo, f.getValue());
                    f.setValue('');
                }
            },
            'chat-occupants-list tool[action=moderate]' : {
                'click' : this.moderateClicked
            }

        });
    },


    existingRoom: function(users) {
        //Add ourselves to this list
        var allUsers = Ext.Array.unique(users.slice().concat(_AppConfig.userObject.getId()));

        //Check to see if a room with these users already exists, and use that.
        for (var key in this.activeRooms) {
            if (!this.activeRooms.hasOwnProperty(key)) continue;

            var ri = this.activeRooms[key];
            if (arrayEquals(ri.get('Occupants'), allUsers)) {
                return ri;
            }
        }
    },


    enterRoom: function(users) {
        if (!Ext.isArray(users)) users = [users];
        for (var k in users) {
            if (typeof(users[k]) != 'string') {
                if (users[k].getId) {
                    users[k] = users[k].getId();
                }
                else {
                    console.log('ERROR: found something other than a user/username string in occupants list', users[k]);
                    delete users[k];
                    continue;
                }
            }

            if(!UserRepository.isOnline(users[k])) delete users[k];
        }

        users = Ext.Array.clean(users);

        var ri = this.existingRoom(users);
        if (ri)
            this.enteredRoom(ri);
        else //If we get here, there were no existing rooms, so create a new one.
            Socket.emit('chat_enterRoom', {'Occupants': users});
    },




    leaveRoom: function(room){
        delete this.activeRooms[room.getId()];

        Socket.emit('chat_exitRoom', room.getId());
    },

    approveMessages: function(messageIds){
        Socket.emit('chat_approveMessages', messageIds);
    },

    postMessage: function(room, message) {
        Socket.emit('chat_postMessage', {rooms: [room.getId()],Body: message, Class: 'MessageInfo'});
    },

    onMessage: function(msg) {
        var win = this.getChatWindow();
        if(win)win.onMessage(UserDataLoader.parseItems([msg])[0],{});
    },

    onModeratedMessage: function(msg) {
        var win = this.getChatWindow();
        if(win)win.onMessage(UserDataLoader.parseItems([msg])[0],{moderated:true});
    },

    enteredRoom: function(msg) {
        var roomInfo = UserDataLoader.parseItems([msg])[0];

        if (roomInfo.getId() in this.activeRooms) {
            console.log('WARNING: room already exists, all rooms/roominfo', this.activeRooms, roomInfo);
        }

        var eri = this.existingRoom(roomInfo.get('Occupants'));
        if (eri) {
            eri.fireEvent('changed', roomInfo);
            this.leaveRoom(eri);
        }

        this.activeRooms[roomInfo.getId()] = roomInfo;
        
        this.openChatWindow();
        this.getChatWindow().addNewChat(roomInfo);
    },

    moderateChat: function(roomInfo) {
        Socket.emit('chat_makeModerated', roomInfo.getId(), true);
    },


    toolClicked: function(field) {
        var a = field.action.toLowerCase(),
            b = field.up('chat-log-view[moderated=true]');

        if (!a || !b){
            console.log('Skipping action, no action specified or no logs', a, b);
            return;
        }

        if(a in b){
            b[a].call(b);
        }
        else {
            console.log('component does not implement the function:',a);
        }
    },

    moderateClicked: function(cmp){
        var chatView = cmp.up('chat-view');

        chatView.openModerationPanel();
        this.moderateChat(chatView.roomInfo);
    },

    openChatWindow: function(){
        (this.getChatWindow() || Ext.create('widget.chat-window')).show();
    },

    friendEntryClicked: function(u) {
        //open a new tab to chat with this user...
        this.enterRoom(u);
    },

    groupEntryClicked: function(group){
        this.enterRoom(group.get('friends'));
    }
});