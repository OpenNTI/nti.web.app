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
            'chat_enteredRoom': function(){me.onEnteredRoom.apply(me, arguments)},
            'disconnect': function(){me.onSocketDisconnect.apply(me, arguments)},
            'serverkill': function(){me.onSocketDisconnect.apply(me, arguments)},
            'chat_recvMessage': function(){me.onMessage.apply(me, arguments)},
            'chat_exitedRoom' : function(){me.onExitedRoom.apply(me, arguments)},
            'chat_roomMembershipChanged' : function(){me.onMembershipChanged.apply(me, arguments)},
            'chat_recvMessageForModeration' : function(){me.onModeratedMessage.apply(me, arguments);},
            'chat_presenceOfUserChangedTo' : function(user, presence){UserRepository._presenceChanged(user, presence);},
            'chat_recvMessageForAttention' : function(){me.onMessageForAttention.apply(me, arguments);},
            'chat_recvMessageForShadow' : function(){console.log('!!!got a message to shadow', arguments)}
        });


        this.control({
            'chat-window splitbutton menuitem': {
                'click': this.flaggedMenuItemClicked
            },
            'chat-window splitbutton[action=flagged]': {
                'click' : function(btn){
                    var i = btn.menu.items,
                        c = (btn.lastAction+1) % i.getCount();

                    btn.lastAction = isNaN(c) ? 0 : c;

                    this.flaggedMenuItemClicked(i.getAt(btn.lastAction));
                }
            },
            'leftColumn button[showChat]':{
                'click': this.openChatWindow
            },

            'chat-friends-view' : {
                'group-click': this.groupEntryClicked
            },

            'chat-friend-entry' : {
                click : this.friendEntryClicked,
                'messages-dropped' : this.flagMessagesTo
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
            },
            'chat-log-entry' : {
                'reply-public': this.replyPublic
            },
            'chat-log-entry-moderated' : {
                'reply-public': this.replyPublic
            }

        });
    },

    /* UTILITY METHODS */

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

    postMessage: function(room, message) {
        Socket.emit('chat_postMessage', {ContainerId: room.getId(), Body: message, Class: 'MessageInfo'});
    },

    approveMessages: function(messageIds){
        Socket.emit('chat_approveMessages', messageIds);
    },

    enterRoom: function(users) {
        if (!Ext.isArray(users)) users = [users];

        users = Ext.Array.clone(users);
        
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

    showMessage: function(msgCmp) {
        var log = msgCmp.up('chat-log-view'),
            tab = log.up('chat-view'),
            tabpanel = tab.up('tabpanel');

        tabpanel.setActiveTab(tab);
        log.scroll(msgCmp);
    },


    moderateChat: function(roomInfo) {
        Socket.emit('chat_makeModerated', roomInfo.getId(), true);
    },

    /* CLIENT EVENTS */

    flaggedMenuItemClicked: function(mi) {
        this.showMessage(mi.relatedCmp);
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

    flagMessagesTo: function(user, dropData){
        var u = [], m = [];
        u.push(user.getId());
        m.push(dropData.data.ID);
        Socket.emit('chat_flagMessagesToUsers', m, u);
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
    },

    leaveRoom: function(room){
        if (!room) return;
        
        delete this.activeRooms[room.getId()];

        Socket.emit('chat_exitRoom', room.getId());
    },

    replyPublic: function(msgCmp) {
      console.log(arguments);
    },

    /* SERVER EVENT HANDLERS*/

    onMessageForAttention: function(mid) {
        var w = this.getChatWindow();
        if (!w) {
            console.log('chat window is not open');
            return;
        }

        var m = w.query('[messageId='+mid+']')[0],
            msg = m ? m.message : null,
            u = msg ? UserRepository.getUser(msg.get('Creator')) : null,
            name = u ? u.get('alias') || u.get('realname') : null,
            i = u ? u.get('avatarURL'): null,
            b = w.query('button[action=flagged]')[0],
            self = this;

        if (!m || !msg) {
            console.log('can not find messages')
            return;
        }

        b.enable();
        var c = parseInt(b.getText(), 10);
        b.setText(isNaN(c) ? 1 : c+1);

        m.addCls('flagged');

        b.menu.add({
            text:Ext.String.format('<b>{0}</b> - {1}', name, Ext.String.ellipsis(msg.get('Body'), 15)),
            icon: i,
            relatedCmp: m
        });


    },

    onSocketDisconnect: function(){
       this.activeRooms = {};
    },

    onMembershipChanged: function(msg) {
        var roomInfo = UserDataLoader.parseItems([msg])[0];

        if (roomInfo.getId() in this.activeRooms)
            this.activeRooms[roomInfo.getId()].fireEvent('changed', roomInfo);

        this.activeRooms[roomInfo.getId()] = roomInfo;
    },

    onExitedRoom: function(room) {
        if (room.ID in this.activeRooms) {
            this.activeRooms[room.ID].fireEvent('left-room');
            delete this.activeRooms[room.ID];
        }
    },

    onMessage: function(msg) {
        var win = this.getChatWindow();
        if(win)win.onMessage(UserDataLoader.parseItems([msg])[0],{});
    },

    onModeratedMessage: function(msg) {
        var win = this.getChatWindow();
        if(win)win.onMessage(UserDataLoader.parseItems([msg])[0],{moderated:true});
    },

    onEnteredRoom: function(msg) {
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
    }

});