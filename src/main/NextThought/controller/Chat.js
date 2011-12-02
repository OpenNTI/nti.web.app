Ext.define('NextThought.controller.Chat', {
    extend: 'Ext.app.Controller',
    requires: [
        'NextThought.util.ParseUtils',
        'NextThought.proxy.Socket',
        'NextThought.view.modes.Classroom',
        'NextThought.util.Classroom',
        'NextThought.cache.IdCache',
        'NextThought.cache.IdCache',
        'NextThought.util.AnnotationUtils'
    ],

    models: [
        'FriendsList',
        'MessageInfo',
        'RoomInfo'
    ],

    views: [
        'modes.Classroom',
        'content.Classroom',
        'windows.ChatWindow',
        'widgets.chat.View',
        'widgets.chat.Log',
        'widgets.chat.Friends',
        'widgets.chat.FriendEntry',
		'windows.NoteEditor'
    ],

    refs: [
        { ref: 'chatWindow', selector: 'chat-window'},
        { ref: 'classroomMode', selector: 'classroom-mode-container'}
    ],


    init: function() {
    	this.activeRooms = {};

        var me = this;

        Socket.register({
            'disconnect': function(){me.onSocketDisconnect.apply(me, arguments)},
            'serverkill': function(){me.onSocketDisconnect.apply(me, arguments)},
            'chat_enteredRoom': function(){me.onEnteredRoom.apply(me, arguments)},
            'chat_exitedRoom' : function(){me.onExitedRoom.apply(me, arguments)},
            'chat_roomMembershipChanged' : function(){me.onMembershipChanged.apply(me, arguments)},
            'chat_presenceOfUserChangedTo' : function(user, presence){UserRepository._presenceChanged(user, presence);},
            'chat_recvMessage': function(){me.onMessage.apply(me, arguments)},
            'chat_recvMessageForAttention' : function(){me.onMessageForAttention.apply(me, arguments);},
            'chat_recvMessageForModeration' : function(){me.onModeratedMessage.apply(me, arguments);},
            'chat_recvMessageForShadow' : function(){me.onMessage.apply(me, arguments);
            }
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
                'shadow' : this.shadowClicked,
                'messages-dropped' : this.flagMessagesTo
            },

            'chat-view':{
                'beforedestroy': function(cmp){
                    if (!cmp.disableExitRoom)
                        this.leaveRoom(cmp.roomInfo);
                }
            },

            'chat-log-view':{'approve': function(ids){this.approveMessages(ids)}},
            'chat-log-view button[action]':{'click': this.toolClicked},
            'chat-log-view tool[action]':{'click': this.toolClicked},

			'noteeditor button[action=send]':{ 'click': this.sendComposed },
            'chat-view chat-reply-to' : {
				'compose': this.compose,
                'send': this.send,
                'classroom': this.classroom
            },
            'chat-occupants-list tool[action=moderate]' : {
                'click' : this.moderateClicked
            },
            'chat-log-entry' : {
                'reply-public': this.replyPublic,
                'reply-whisper': this.replyWhisper
            },
            'chat-log-entry-moderated' : {
                'reply-public': this.replyPublic,
                'reply-whisper': this.replyWhisper
            }

        },{});
    },

    /* UTILITY METHODS */
	getClassroom: function(){
		return this.getController('Classroom');
	},


    existingRoom: function(users, options) {
        //Add ourselves to this list
        var allUsers = Ext.Array.unique(users.slice().concat(_AppConfig.userObject.getId()));

		if(options){
			return null;
		}

        //Check to see if a room with these users already exists, and use that.
        for (var key in this.activeRooms) {
            if (!this.activeRooms.hasOwnProperty(key)) continue;

            var ri = this.activeRooms[key];
            if (arrayEquals(ri.get('Occupants'), allUsers)) {
                return ri;
            }
        }
    },

    postMessage: function(room, message, replyTo, channel, recipients) {

		if(typeof message == 'string')
			message = [message];

        var m = {ContainerId: room.getId(), body: message, Class: 'MessageInfo'};

        if (replyTo) m.inReplyTo = replyTo;
        if (channel) m.channel = channel;
        if (recipients) m.recipients = recipients;

        Socket.emit('chat_postMessage', m);
    },

    approveMessages: function(messageIds){
        Socket.emit('chat_approveMessages', messageIds);
    },

    enterRoom: function(usersOrList, options) {
		options = options || {};
        var users = [];

        if (usersOrList.get && usersOrList.get('friends')) {
            options['ContainerId'] = usersOrList.get('NTIID');
        }
        else if (!Ext.isArray(usersOrList)) users = [usersOrList];
        else users = usersOrList;

        users = Ext.Array.clone(users);
        
        for (var k in users) {
            if (typeof(users[k]) != 'string') {
                if (users[k].getId) {
                    users[k] = users[k].getId();
                }
                else {
                    console.error('ERROR: found something other than a user/username string in occupants list', users[k]);
                    delete users[k];
                    continue;
                }
            }

            if(!UserRepository.isOnline(users[k])) delete users[k];
        }

        users = Ext.Array.clean(users);

        var ri = this.existingRoom(users,options);
        if (ri)
            this.onEnteredRoom(ri);
        else{ //If we get here, there were no existing rooms, so create a new one.
			var roomCfg = {'Occupants': users};

            //no occupants required if there's a container id and it's a class/study room etc.
			if(options.ContainerId && ClassroomUtils.isClassroomId(options.ContainerId)){
				roomCfg.Occupants = [];
			}

            Socket.emit('chat_enterRoom', Ext.apply(roomCfg, options));
		}
    },

    showMessage: function(msgCmp) {
        var log = msgCmp.up('chat-log-view'),
            tab = log.up('chat-view'),
            tabpanel = tab.up('tabpanel');

        tabpanel.setActiveTab(tab);
        log.scroll(msgCmp);
    },


    moderateChat: function(roomInfo) {
        console.log('moderate clicked', arguments);
        Socket.emit('chat_makeModerated', roomInfo.getId(), true);
    },

    /* CLIENT EVENTS */

	compose: function(textField, replyToId, channel, recipients){
		var room = textField.up('chat-view').roomInfo,
			record = Ext.create('NextThought.model.MessageInfo',{
			inReplyTo: replyToId,
			channel: channel,
			recipients: recipients
		}),
			win = Ext.widget('noteeditor',{
				record: record,
				room: room,
				closable: true,
				closeAction: 'destroy',
				title: 'Compose Message',
				modal: true,
				bbar: [
						'->',
				  		{ xtype: 'button', text: 'Send',	action: 'send' },
				  		{ xtype: 'button', text: 'Cancel',	action: 'cancel' }
					]});

		win.show();

	},


	sendComposed: function(btn){
		var win = btn.up('window'),
			rec = win.record,
			room = win.room;

		this.postMessage(
				room,
				win.getValue(),
				rec.get('inReplyTo'),
				rec.get('channel'),
				rec.get('recipients'));

		win.close();
	},


    send: function(f, mid, channel, recipients) {
        var room = f.up('chat-view').roomInfo,
            val = f.getValue();

        if (Ext.isEmpty(val)) return;
        
        this.postMessage(room, val, mid, channel, recipients);


        f.setValue('');
        f.focus();
    },

    classroom: function(f, mid, channel, recipients) {
        var room = f.up('chat-view').roomInfo;

        if (!this.getClassroom().isClassroom(room)) {
            console.log('not a chat room that can turn into a classroom, sorry, figure out how to disable this button or hide it');
            return;
        }

        //close this tab, hide window
        this.getChatWindow().closeChat(room, true);
        this.getChatWindow().hide();

        //mode to classroom, call showClassroom on Classroom mode?
        this.getClassroomMode().activate();
        this.getClassroomMode().hideClassChooser();
        this.getClassroom().onEnteredRoom(room);

     },

    flaggedMenuItemClicked: function(mi) {
        this.showMessage(mi.relatedCmp);
    },

    toolClicked: function(field) {
        var a = field.action.toLowerCase(),
            b = field.up('chat-log-view[moderated=true]');

        if (!a || !b){
            console.warn('Skipping action, no action specified or no logs', a, b);
            return;
        }

        if(a in b){
            b[a].call(b);
        }
        else {
            console.warn('component does not implement the function:',a);
        }
    },

    moderateClicked: function(cmp){
        var chatView;

        if (this.getClassroom().isActive()) {
            chatView = cmp.up('classroom-content').down('chat-view');
        }
        else {
            chatView = cmp.up('chat-view');
            chatView.openModerationPanel();
        }

        this.moderateChat(chatView.roomInfo);
    },

    flagMessagesTo: function(user, dropData){
        var u = [], m = [];
        u.push(user.getId());
        m.push(dropData.data.OID);
        Socket.emit('chat_flagMessagesToUsers', m, u);
    },

    openChatWindow: function(){
        (this.getChatWindow() || Ext.create('widget.chat-window')).show();
    },

    friendEntryClicked: function(u) {
        //open a new tab to chat with this user...
        this.enterRoom(u);
    },

    shadowClicked: function(r,user) {
        var u = [];
        u.push(user.getId());
        Socket.emit('chat_shadowUsers',r, u);
     },

    groupEntryClicked: function(group){
        this.enterRoom(group);
    },

    leaveRoom: function(room){
        if (!room) return;
        
        delete this.activeRooms[room.getId()];

        Socket.emit('chat_exitRoom', room.getId());
    },

    replyPublic: function(msgCmp) {
        msgCmp.showReplyToComponent().setChannel('DEFAULT');
    },

    replyWhisper: function(msgCmp) {
        var message = msgCmp.message,
            w = msgCmp.up('chat-window'),
            recipients = new Ext.util.HashMap();

        recipients.add(message.get('Creator'), 1);
        recipients.add(_AppConfig.userObject.getId(), 1);

        while(w && message && message.get('inReplyTo')){
            var r = IdCache.getIdentifier('inReplyTo'),
                m = w.down(Ext.String.format('*[messageId={1}]', r));

            if(!m || !m.message)break;

            message = m.message;
            recipients.add(message.get('Creator'), 1);
        }

        msgCmp.showReplyToComponent().setChannel('WHISPER', recipients.getKeys());
    },

    /* SERVER EVENT HANDLERS*/

    onMessageForAttention: function(mid) {
        var w = this.getChatWindow();
        if (!w) {
            console.warn('chat window is not open');
            return;
        }

        var m = w.query('[messageId='+IdCache.getIdentifier(mid)+']')[0],
            msg = m ? m.message : null,
            u = msg ? UserRepository.getUser(msg.get('Creator')) : null,
            name = u ? u.get('alias') || u.get('realname') : null,
            i = u ? u.get('avatarURL'): null,
            b = w.query('button[action=flagged]')[0],
            self = this;

        if (!m || !msg) {
            console.error('can not find messages')
            return;
        }

        b.enable();
        var c = parseInt(b.getText(), 10);
        b.setText(isNaN(c) ? 1 : c+1);

        m.addCls('flagged');

        b.menu.add({
            text:Ext.String.format('<b>{0}</b> - {1}', name, Ext.String.ellipsis(AnnotationUtils.getBodyTextOnly(msg), 15)),
            icon: i,
            relatedCmp: m
        });


    },

    onSocketDisconnect: function(){
       this.activeRooms = {};
    },

    onMembershipChanged: function(msg) {
        var roomInfo = ParseUtils.parseItems([msg])[0];

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
        var m = ParseUtils.parseItems([msg])[0];

        if (this.getClassroom().isClassroom(m)) {
			this.getClassroom().onMessage(m, {});
			return;
        }

		var win = this.getChatWindow();
		if(win)win.onMessage(m,{});
    },

    onModeratedMessage: function(msg) {
        var m = ParseUtils.parseItems([msg])[0],
            o = {moderated:true};

		if (this.getClassroom().isClassroom(m)) {
			this.getClassroom().onMessage(m, o);
			return;
		}

        var win = this.getChatWindow();
        if(win)win.onMessage(m,o);
    },

    onEnteredRoom: function(msg) {
        var roomInfo = msg && msg.isModel? msg : ParseUtils.parseItems([msg])[0];
        if (this.getClassroom().isActive()) {
//		if (this.getClassroom().isClassroom(roomInfo)) {
			this.getClassroom().onEnteredRoom(roomInfo);
			return;
		}

        if (roomInfo.getId() in this.activeRooms) {
            console.warn('room already exists, all rooms/roominfo', this.activeRooms, roomInfo);
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
