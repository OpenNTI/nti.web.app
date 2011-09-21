Ext.define('NextThought.controller.Chat', {
    extend: 'Ext.app.Controller',
    requires: [
        'NextThought.proxy.UserDataLoader'
    ],

    views: [
        'windows.ChatWindow',
        'widgets.chat.View',
        'widgets.chat.Log',
        'widgets.chat.Friends',
        'widgets.chat.FriendEntry'
    ],

    refs: [
        {
            ref: 'chatWindow',
            selector: 'chat-window'
        }
    ],

    statics: {
        observable: Ext.create('Ext.util.Observable'),

         /**
         * Set up a task that will check io availability every second until it becomes
         * available, then call setupSocket.
         *
         * @param username
         * @param password
         */
        ensureSocketAvailable: function(username, password) {
            var _task = {
                run: function(){
                    if (io) {
                        this.setupSocket(username, password);
                        Ext.TaskManager.stop(_task);
                    }
                },
                scope: this,
                interval: 1000
            };

            Ext.TaskManager.start(_task);
        },

        /**
         * Destroy the socket.
         */
        tearDownSocket: function(){
            this.socket.disconnect();
            delete this.socket;
        },

        /**
         * Attempts to create a socket connection to the dataserver for this user.
         *
         * @param username
         * @param password
         */
        setupSocket: function(username, password) {
            if (!io) {//if no io, then call ensure to wait until io is available
                this.ensureSocketAvailable(username, password);
                return;
            }

            if (this.socket) {
                socket.disconnect();
                delete this.socket;
            }


            var socket = io.connect(_AppConfig.server.host),
                me = this;

            socket.on('connect', function() {
                socket.emit( 'message', username, password );
                socket.emit( 'message', 'json' );
            });

            socket.on('serverkill', function() {me.onKill.apply(me, arguments);});
            socket.on('error', function() {me.onError.apply(me, arguments);});
            socket.on('disconnect', function() {me.onDisconnect.apply(me, arguments);});
            socket.on('chat_enteredRoom', function(){me.enteredRoom.apply(me, arguments)});
            socket.on('chat_recvMessage', function(){me.onMessage.apply(me, arguments)});

            this.socket = socket;
        },

        enterRoom: function(users) {
            if (!Ext.isArray(users)) users = [users];
            for (var k in users) {
                if (typeof(users[k]) != 'string') {
                    if (users[k].get && users[k].get('Username')) {
                        users[k] = users[k].get('Username');
                    }
                    else {
                        console.log('ERROR: found something other than a user/username string in occupants list', users[k]);
                        delete users[k];
                    }
                }
            }

            this.socket.emit('chat_enterRoom', {'Occupants': users})
        },

        leaveRoom: function(room){
            this.socket.emit('chat_exitRoom', room.data);
        },


        postMessage: function(room, message) {
            this.socket.emit('chat_postMessage', {rooms: [room.getId()],Body: message, Class: 'MessageInfo'});
        },

        onDisconnect: function() {
            console.log('disconnect', arguments);
        },

        onError: function() {
            console.log('error',arguments);
        },

        onKill: function() {
            console.log( 'asked to die' );
            this.socket.disconnect();
        },

        onMessage: function(msg) {
            this.observable.fireEvent('message', UserDataLoader.parseItems([msg])[0]);
        },

        enteredRoom: function(msg) {
            this.observable.fireEvent('enteredRoom', UserDataLoader.parseItems([msg])[0]);
        }

    },

    init: function() {
        this.self.observable.on('enteredRoom', this.enteredRoom, this);
        
        this.control({
            'leftColumn button[showChat]':{
                'click': this.openChatWindow
            },
            'chat-friends-view' : {
                'afterrender': this.showFriendsList,
                'group-click': this.groupEntryClicked
            },
            'chat-friend-entry' : {
                click : this.friendEntryClicked
            },
            'chat-view':{
                'beforedestroy': function(cmp){
                    this.self.leaveRoom(cmp.roomInfo);
                }
            },
            'chat-window' : {
                'beforedestroy' : function(cmp) {
                    this.self.observable.un('message', cmp.onMessage, cmp);
                },
                'afterrender' : function(cmp){
                    this.self.observable.on('message', cmp.onMessage, cmp);
                }
            },
            'chat-view textfield' : {
                'specialkey' : function(f, e) {
                    if (e.getKey() != e.ENTER) return;
                    this.self.postMessage(f.up('chat-view').roomInfo, f.getValue());
                    f.setValue('');
                }
            }

        });
    },


    openChatWindow: function(){
        (this.getChatWindow() || Ext.create('widget.chat-window')).show();
    },

    friendEntryClicked: function(u) {
        //open a new tab to chat with this user...
        this.self.enterRoom(u);
    },

    groupEntryClicked: function(group){
        this.self.enterRoom(group.get('friends'));
    },

    enteredRoom: function(ri) {
        this.openChatWindow();
        this.getChatWindow().addNewChat(ri);
    },

    showFriendsList: function(cmp) {
        var task = {
            run: function(){
                if(cmp && !cmp.isDestroyed){
                    UserDataLoader.getGroups({
                        scope: cmp,
                        success: cmp.setGroups,
                        failure: failure
                    });
                }
                else {
                    Ext.TaskManager.stop(task);
                }
            },
            scope: this,
            interval: 10000
        };

        Ext.TaskManager.start(task);

        function failure() {
            console.log("FAIL loading groups for friends list", arguments);
            Ext.TaskManager.stop(task);
        }

    }
});