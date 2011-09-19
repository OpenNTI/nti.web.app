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
            socket.on('message', function() {me.onMessage.apply(me, arguments);});
            socket.on('news', function() {me.onNews.apply(me, arguments);});

            this.socket = socket;
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
            this.observable.fireEvent('message', msg);
        },

        onNews: function(msg) {
            this.observable.fireEvent('news', msg);
        }
    },

    init: function() {
        this.control({
            'leftColumn button[showChat]':{
                click: function(){
                    Ext.create('window.chat').show();
                }
            },
            'chat-friends-view' : {
                afterrender: this.showFriendsList
            },
            'chat-friend-entry' : {
                click : this.friendEntryClicked
            },
            'chat-log-view' : {
                beforedestroy : function(cmp) {
                    this.self.observable.un('message', cmp.addMessage, cmp);
                    this.self.observable.un('news', cmp.addNews, cmp);
                },
                afterrender : function(cmp){
                    this.self.observable.on('message', cmp.addMessage, cmp);
                    this.self.observable.on('news', cmp.addNews, cmp);
                }
            }

        });
    },

    friendEntryClicked: function(u) {
        console.log('friend clicked', u);
    },

    showFriendsList: function(cmp) {
        UserDataLoader.getGroups({
   			scope: cmp,
   			success: cmp.setGroups,
            failure: failure
   		});
        
        function failure() {
            console.log("FAIL loading groups for friends list", arguments);
        }

    }
});