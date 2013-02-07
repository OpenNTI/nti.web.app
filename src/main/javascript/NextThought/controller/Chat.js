Ext.define('NextThought.controller.Chat', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.cache.IdCache',
		'NextThought.util.Annotations',
		'NextThought.util.Classrooms',
		'NextThought.util.Parsing',
		'NextThought.proxy.Socket',
		'NextThought.view.toast.Manager'
	],


	models: [
		'FriendsList',
		'MessageInfo',
		'RoomInfo'
	],


	views: [
		'chat.Window',
        'chat.transcript.Window'
	],


	refs: [
		{ ref: 'classroomMode', selector: 'classroom-view-container'}
	],


	init: function() {
		var me = this;
		this.setChannelMap();

		//A reference to the socket to use for live messages
		this.socket = this.socket || Socket;

		this.socket.register({
			'disconnect': function(){me.onSocketDisconnect.apply(me, arguments);},
			'serverkill': function(){me.onSocketDisconnect.apply(me, arguments);},
			'chat_enteredRoom': function(){me.onEnteredRoom.apply(me, arguments);},
			'chat_exitedRoom' : function(){me.onExitedRoom.apply(me, arguments);},
			'chat_roomMembershipChanged' : function(){me.onMembershipOrModerationChanged.apply(me, arguments);},
//			'chat_roomModerationChanged' : function(){me.onModerationChange.apply(me, arguments);},
			'chat_presenceOfUserChangedTo' : function(user, presence){UserRepository.presenceChanged(user, presence);},
			'chat_recvMessage': function(){me.onMessage.apply(me, arguments);},
//			'chat_recvMessageForAttention' : function(){me.onMessageForAttention.apply(me, arguments);},
//			'chat_recvMessageForModeration' : function(){me.onModeratedMessage.apply(me, arguments);},
			'chat_recvMessageForShadow' : function(){me.onMessage.apply(me, arguments);}
//			'chat_failedToEnterRoom' : function(){me.onFailedToEnterRoom.apply(me, arguments);}
		});

		this.control({

//			'chat-log-view':{'approve': function(ids){this.approveMessages(ids);}},
//			'chat-log-view button[action]':{'click': this.toolClicked},
//			'chat-log-view tool[action]':{'click': this.toolClicked},

			'chat-view chat-entry' : {
				//'classroom': this.classroom,
				'send': this.send,
				'send-whiteboard': this.sendWhiteboard
			},

            'chat-view chat-log-entry': {
	            'reply-to-whiteboard': this.replyToWhiteboard
            },

            'chat-view': {
                'flag-messages': this.flagMessages,
	            'publish-chat-status': this.publishChatStatus
            },


            'chat-transcript-window': {
                'flag-messages': this.flagTranscriptMessages
            },

			'contacts-panel': {
				'group-chat': this.enterRoom
			},

			'chat-window': {
				'beforedestroy': function(cmp){
					if (!cmp.disableExitRoom) {
						this.leaveRoom(ClassroomUtils.getRoomInfoFromComponent(cmp));
					}
				},

				'add-people': function(cmp,people){
					var ri = ClassroomUtils.getRoomInfoFromComponent(cmp),
						o = ri.data.Occupants;

					if(!Ext.isArray(people)){
						people = [people];
					}
					o.push.apply(o,people);
					this.socket.emit('chat_enterRoom', {NTIID: ri.getId(), Occupants: o});
				}
			},

			'script-entry' : {
				'script-to-chat': this.send
			}

		},{});

		//handle some events on session, open existing chat rooms and clear the session on logout.
		this.application.on('session-ready', this.onSessionReady, this);
		this.application.on('session-closed', function(){this.removeSessionObject();}, this);
	},

	setChannelMap: function(){
		//table of behaviour based on channel
		this.channelMap = {
			//			'CONTENT': this.onMessageContentChannel,
			//			'POLL': this.onMessagePollChannel,
			//			'META': this.onMessageMetaChannel,
			'DEFAULT': this.onMessageDefaultChannel,
			'WHISPER' : this.onMessageDefaultChannel,
			'STATE' : this.onReceiveStateChannel
		};
	},

	onSessionReady: function(){
		//open any rooms we were currently involved in
		var me = this,
			roomInfos = me.getAllRoomInfosFromSession(),
			w;
		Ext.each(roomInfos, function(ri) {
			me.onEnteredRoom(ri);
			w = me.getChatWindow(ri);

			//This chunk will try to recover the history and insert it into the chat again...
			ViewUtils.getTranscript(ri.getId(),
				ri.get('Last Modified'),
				function(transcript){
					var messages = transcript.get('Messages');
					messages = Ext.Array.sort(messages, Globals.SortModelsBy('CreatedTime'));

					Ext.each(messages, function(m){
						me.onMessage(m);
					}, me);
					if(me.isRoomIdAccepted(ri.getId())){
		                w.show();
		                w.minimize();
		            }
				},
				function(){
					console.error('Could not recover chat history.');
				}, this);

		});

	},


	/* UTILITY METHODS */
//	getClassroom: function(){
//		return this.getController('Classroom');
//	},


	getChatWindow: function(r) {
		if (!r){return null;}

		var rIsString = (typeof(r) === 'string'),
			id = IdCache.getIdentifier(rIsString ? r : r.getId()),
            w = Ext.ComponentQuery.query('chat-window[roomInfoHash='+id+']')[0],
            allRooms = Ext.ComponentQuery.query('chat-window'),
            xOcc;

        if (!w){
            //see if we have rooms with the same occupants list:
            Ext.each(allRooms, function(x){
                xOcc = x.roomInfo.get('Occupants');
                //only do the next step for 1 to 1 chats, group chat changes like this could really mess everyone else up.
                if(xOcc.length > 2){return;}
	            if(rIsString){ return;} //Be defensive.
                if(Ext.Array.union(xOcc, r.get('Occupants')).length === xOcc.length){
                    console.log('found a different room with same occupants');
                    x.roomInfoChanged(r);
                    w = x;
                }
            });
        }

        return w;
	},


	isModerator: function(ri) {
		return Ext.Array.contains(ri.get('Moderators'), $AppConfig.username);
	},


	/**
	 * Check to see if a room already exists.  A room exists when any of the following conditions are met, in this order:
	 *1) if there's a roomId sent.  there must be an existing roomId in the active rooms object.
	 *2) if no roomId is sent, then look for a room with the same constituants, that room must not be a group/class.
	 *
	 * @param users {Array} list of users
	 * @param roomId {String} roomid
	 * @param options {Object}
	 * @return {NextThought.model.RoomInfo}
	 */
	existingRoom: function(users, roomId, options) {
		//Add ourselves to this list
		var key, rInfo,
			allUsers = Ext.Array.unique(users.slice().concat($AppConfig.username)),
			chats = this.getSessionObject();

		if(options && options.ContainerId && !roomId){
			roomId = options.ContainerId;
		}

		for (key in chats) {
			if(chats.hasOwnProperty(key)){
				rInfo = this.getRoomInfoFromSession(key,chats[key]);
				if (rInfo){
					if (roomId && roomId === rInfo.getId()){
						break;//leave rInfo as is, so we can return it;
					}
					else if (!ClassroomUtils.isClassroomId(rInfo.getId())) {

						if( Ext.Array.difference(rInfo.get('Occupants'),allUsers).length === 0
						&&	Ext.Array.difference(allUsers,rInfo.get('Occupants')).length === 0 ){
							break;//leave rInfo as is, so we can return it
						}
					}
					rInfo = null;
				}
			}
		}

		return rInfo;
	},


	postMessage: function(room, message, replyTo, channel, recipients, ack) {

		if(typeof message === 'string') {
			message = [message];
		}

		var m = {ContainerId: room.getId(), body: message, Class: 'MessageInfo'},
			messageRecord;

		if (channel) {
			m.channel = channel;
		}
		if (recipients) {
			m.recipients = recipients;
		}

		if(ack){
			messageRecord = ParseUtils.parseItems([m]);
			messageRecord = messageRecord && messageRecord.length > 0 ? messageRecord[0] : null;
			ack = Ext.bind(ack, null, [messageRecord], true);
		}

		this.socket.emit('chat_postMessage', m, ack);
	},

	approveMessages: function(messageIds){
		this.socket.emit('chat_approveMessages', messageIds);
	},

	/*
	 * Creates a room to enter from the given user, list of user, or friends list / dfl.
	 * If a friendslist or dfl is provided, the option persistent will define if that list is
	 * expanding to a list of friends, or used to start a persistent room.  If persistent is missing
	 * the default behaviour is to start a persistent list (this seems backwards but it is the old
	 * behaviour.
	 */
	enterRoom: function(usersOrList, options) {
		if (!$AppConfig.service.canChat()) {
			console.log('User not permissioned to chat.');
			return;
		}

		options = options || {};
		var users = [], k, ri, roomCfg,
			openPersistently = options.persistent !== undefined ? options.persistent : true,
			isListOrDFL = usersOrList.get && usersOrList.get('friends');

		//Don't send the persistent option to the ds
		delete options.persistent;

		//chat rooms need a containerId, make sure we add these, let them get overridden later if it's a persistant room
		options.ContainerId = options.ContainerId || LocationProvider.currentNTIID || Globals.CONTENT_ROOT;
		if (!options.ContainerId){
			delete options.ContainerId;
		}

		//We do persistence if it was requested and we were given something that can
		//be opened persistently
		if(isListOrDFL && openPersistently){
			//OK it is something that can be opened persistently, and we want it
			//persistent.  Update the ContainerId to reflect it.  In this case we don't
			//specify users
			options.ContainerId = usersOrList.get('NTIID');
			console.log('Will start a persistent room for container', options.ContainerId);
		}
		else{
			//Not persistent, if it is a group or dfl pull out the users, it could also
			//already be a list of users, or a user
			if(isListOrDFL){
				users = usersOrList.get('friends');
			}
			else if(!Ext.isArray(usersOrList)){
				users = [usersOrList];
			}
			else{
				users = usersOrList;
			}
		}

		users = Ext.Array.clone(users);

		for (k in users) {
			if(users.hasOwnProperty(k)) {
				if (typeof(users[k]) !== 'string') {
					if (users[k].getId) {
						users[k] = users[k].getId();
					}
					else {
						console.error('ERROR: found something other than a user/username string in occupants list', users[k]);
						delete users[k];
					}
				}
			}
		}

		users = Ext.Array.clean(users);

		ri = this.existingRoom(users, (options.ContainerId || null), options);
		if (ri) {
			this.onEnteredRoom(ri);
		}
		else { //If we get here, there were no existing rooms, so create a new one.
			roomCfg = {'Occupants': users};

			//no occupants required if there's a container id and it's a class/study room etc.
			if(options.ContainerId && ClassroomUtils.isClassroomId(options.ContainerId)){
				roomCfg.Occupants = [];
			}
			this.socket.emit('chat_enterRoom', Ext.apply(roomCfg, options));
		}
	},


	showMessage: function(msgCmp) {
		var log = msgCmp.up('chat-log-view'),
			tab = log.up('chat-view'),
			tabpanel = tab.up('tabpanel');

		tabpanel.setActiveTab(tab);
		log.scroll(msgCmp);
	},


	/* CLIENT EVENTS */

	sendAckHandler: function(result, m){
		function isError(result){
			var errorCode = 'error-type';
			return result.hasOwnProperty(errorCode) && result[errorCode] === 'client-error';
		}
		if(isError(result)){
			this.onMessageError(result, m);
		}
	},

	clearErrorForRoom: function(room){
		var cid, win, log, view;

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?

		cid = room.getId();
		win = this.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if(view){
			view.clearError();
		}
		else{
			console.error('Unable to clear error for messages window', msg);
		}
	},

	send: function(f, mid, channel, recipients) {
		var room = ClassroomUtils.getRoomInfoFromComponent(f),
			val = f.getValue(),
			me = this;

		if (!room || Ext.isEmpty(val,false)) {
			console.error('Cannot send message, room', room, 'values', val);
			return;
		}
		this.clearErrorForRoom(room);
		this.postMessage(room, val, mid, channel, recipients, Ext.bind(me.sendAckHandler, me));

		f.focus();
	},

	replyToWhiteboard: function(wbData, cmp, midReplyOf, channel, recipients){
		this.showWhiteboard(wbData,cmp,midReplyOf,channel, recipients);
	},

	sendWhiteboard: function(chatEntryWidget, mid, channel, recipients) {
		this.showWhiteboard(null,chatEntryWidget,mid,channel, recipients);
	},

	showWhiteboard: function(data, cmp, mid, channel, recipients) {
		var me = this,
			room = ClassroomUtils.getRoomInfoFromComponent(cmp),
			wbWin = Ext.widget('wb-window', {width: 802, value: data, chatStatusEvent:'status-change', ownerCmp: cmp}),
			wbData;

		//hook into the window's save and cancel operations:
		wbWin.on({
			save: function(win, wb){
				wbData = wb.getValue();
				me.clearErrorForRoom(room);
				me.postMessage(room, [wbData], mid, channel, recipients, Ext.bind(me.sendAckHandler, me));
				wbWin.close();
			},
			cancel: function(){
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				wbWin.close();
			}
		});

		//show window:
		wbWin.show();
	},


    flagMessages: function(messages, chatView){
        var m;
        Ext.each(messages, function(e){
            m = e.message;
            m.postTo('flag', function(){
                console.log('server says', arguments);
            });

            //apply some classes so once we close the moderation, it's still marked
            e.el.down('.log-entry').addCls('confirmFlagged'); //permenantly flag
            e.el.down('.control').addCls('confirmFlagged');
        });

        //return to non moderation view:
        chatView.up('chat-window').onFlagToolClicked();
    },

	/**
	 * NOTE: We will ONLY manage our state in all the rooms we're currently involved in.
	 */
	publishChatStatus: function(room, newStatus, username){
		var channel = 'STATE', oldStatus;
		username = username &&  Ext.isString(username) ? username : $AppConfig.username;
		oldStatus = room.getRoomState(username || $AppConfig.username);
		if(oldStatus !== newStatus){
			console.log('transitioning room state for: ', $AppConfig. username, ' from ', oldStatus, ' to ', newStatus);
			this.postMessage(room, {'state': newStatus}, null, channel, null, Ext.emptyFn );
		}
	},


    flagTranscriptMessages: function(messages, chatView){
		var m, s;
        Ext.each(messages, function(e){
			m = e.message;
			s = Ext.fly(e.sender);
            m.postTo('flag', function(){
                console.log('server says', arguments);
            });

			//apply some classes so once we close the moderation, it's still marked
			s.addCls('confirmFlagged'); //permenantly flag
			s.down('.control').addCls('confirmFlagged');
        });

        //return to non moderation view:
        chatView.onFlagToolClicked();
        chatView.clearFlagOptions();
    },


    /*
        classroom: function(f, mid, channel, recipients) {
            var cv = f.up('chat-view'),
                room = ClassroomUtils.getRoomInfoFromComponent(f),
                mlog = cv.down('chat-log-view[moderated=true]'),
                log = cv.down('chat-log-view[moderated=false]'),
                messages = log.getMessages(),
                moderated = mlog ? true : false,
                c = this.getClassroom();

            if (!ClassroomUtils.isClassroomId(room.get('ContainerId'))) {
                console.warn('not a chat room that can turn into a classroom, sorry, figure out how to disable this button or hide it');
                return;
            }

            //close this tab, hide window
            this.getChatWindow().closeChat(room, true);
            this.getChatWindow().hide();

            //view to classroom, call showClassroom on Classroom view?
            this.getClassroomMode().activate();
            this.getClassroomMode().hideClassChooser();
            c.onEnteredRoom(room, moderated);
            c.onMessage(messages);
         },
    */


//	flaggedMenuItemClicked: function(mi) {
//		this.showMessage(mi.relatedCmp);
//	},


//	flaggedButtonClicked: function(btn){
//		var i = btn.menu.items,
//			c = (btn.lastAction+1) % i.getCount();
//
//		btn.lastAction = isNaN(c) ? 0 : c;
//
//		this.flaggedMenuItemClicked(i.getAt(btn.lastAction));
//	},


//	toolClicked: function(field) {
//		var a = field.action.toLowerCase(),
//			b = field.up('chat-log-view[moderated=true]');
//
//		if (!a || !b){
//			console.warn('Skipping action, no action specified or no logs', a, b);
//			return;
//		}
//
//		if(Ext.isFunction(b[a])){
//			b[a].call(b);
//		}
//		else {
//			console.warn('component does not implement the function:',a);
//		}
//	},


//	contentEntryClicked: function(entry) {
//		var loc = entry.location;
//
//		if (!loc){return;}
//
//		Ext.getCmp('reader').activate();
//		LocationProvider.setLocation(loc.NTIID);
//	},


//	/**
//	 * Someone clicked a moderation button.  If he is currently a moderator, he's requestion
//	 * to relinquish control.  If he's not a moderator, then he wants to be.
//	 *
//	 * @param cmp - the button
//	 */
//	moderateClicked: function(cmp){
//		var roomInfo = ClassroomUtils.getRoomInfoFromComponent(cmp),
//			shouldModerate = this.isModerator(roomInfo) ? false : true;
//
//		console.log('moderate clicked, moderation value', shouldModerate);
//		this.socket.emit('chat_makeModerated', roomInfo.getId(), shouldModerate);
//	},


//	flagMessagesTo: function(user, dropData){
//		var u = [], m = [];
//		u.push(user.getId());
//		m.push(dropData.data.NTIID);
//		Socket.emit('chat_flagMessagesToUsers', m, u);
//	},


	updateRoomInfo: function(ri) {
		var ro = this.getRoomInfoFromSession(ri.getId());
		if (ro) {
			ro.fireEvent('changed', ri);
		}
		this.putRoomInfoIntoSession(ri);
	},


	sendChangeMessages: function(oldRoomInfo, newRoomInfo) {
		var oldOccupants = oldRoomInfo?oldRoomInfo.get('Occupants'):[],
			newOccupants = newRoomInfo.get('Occupants'),
			oldMods = oldRoomInfo?oldRoomInfo.get('Moderators'):[],
			newMods = newRoomInfo.get('Moderators'),
			left = Ext.Array.difference(oldOccupants, newOccupants),
			added = Ext.Array.difference(newOccupants, oldOccupants),
			leftMods = Ext.Array.difference(oldMods, newMods),
			addedMods = Ext.Array.difference(newMods, oldMods);

		this.onOccupantsChanged(newRoomInfo, left, added, leftMods, addedMods);
	},


	openChatWindow: function(roomInfo){
		var w = this.getChatWindow(roomInfo), existingChatWindow;
		if(!w){
			w = Ext.widget(
				'chat-window', {
				roomInfo: roomInfo
			});
		}
		else{
			existingChatWindow = true;
		}

		if(isMe(roomInfo.get('Creator')) || existingChatWindow){
			w.show();
		}
        return w;
	},



	rebuildWindow: function(roomInfoId, callback){
		var service = $AppConfig.service;

		function success(obj){
			this.openChatWindow(obj);
			Ext.callback(callback);
		}

		service.getObject(roomInfoId,
				success,
				function(){
					alert('Could not recover room info');
					console.error('Could not resolve roomInfo for: ',roomInfoId);
				},
				this);
	},


//	occupantClicked: function(u) {
//		this.enterRoom(u);
//	},


//	shadowClicked: function(cmp,user) {
//		var u = [],
//			rid = ClassroomUtils.getRoomInfoIdFromComponent(cmp);
//
//		if (!rid || !user) {
//			console.error('Cannot execute shadow request, cmp', cmp, 'user', user);
//			return;
//		}
//
//		u.push(user.getId());
//		this.socket.emit('chat_shadowUsers',rid, u);
//	 },


	leaveRoom: function(room){
		if (!room) {
			return;
		}
        this.deleteRoomIdStatusAccepted(room.getId());

		if (this.isModerator(room)) {
			console.log('leaving room but I\'m a moderator, relinquish control');
			this.socket.emit('chat_makeModerated', room.getId(), false,
				function(){
					//unmoderate called, now exit
					console.log('unmoderated, now exiting room');
					this.socket.emit('chat_exitRoom', room.getId());
				}
			);
		}
		else {
			//im not a moderator, just leave
			this.socket.emit('chat_exitRoom', room.getId());
		}
	},


//	replyPublic: function(msgCmp) {
//		msgCmp.showReplyToComponent().setChannel('DEFAULT');
//	},


//	replyWhisper: function(msgCmp) {
//		var message = msgCmp.message,
//			w = msgCmp.up('chat-window'),
//			recipients = new Ext.util.HashMap(),
//			r,m;
//
//		recipients.add(message.get('Creator'), 1);
//		recipients.add($AppConfig.username, 1);
//
//		while(w && message && message.get('inReplyTo')){
//			r = IdCache.getIdentifier('inReplyTo');
//			m = w.down(Ext.String.format('*[messageId={1}]', r));
//
//			if(!m || !m.message) {
//				break;
//			}
//
//			message = m.message;
//			recipients.add(message.get('Creator'), 1);
//		}
//
//		msgCmp.showReplyToComponent().setChannel('WHISPER', recipients.getKeys());
//	},


//	pinMessage: function(msgCmp) {
//		var m = msgCmp.message,
//			ri = this.getRoomInfoFromSession(m.get('ContainerId'));
//		this.postMessage(ri, {'channel': m.get('channel'), 'action': 'pin', 'ntiid': m.getId()}, null, 'META');
//	},
//
//	clearPinnedMessages: function(btnCmp) {
//		var ri = ClassroomUtils.getRoomInfoFromComponent(btnCmp);
//		this.postMessage(ri, {'channel': 'DEFAULT', 'action': 'clearPinned'}, null, 'META');
//	},
//
//
	/* SERVER EVENT HANDLERS*/


//	onFailedToEnterRoom: function(ri){
//		if (this.getClassroom().isClassroom(ri)) {
//			this.getClassroom().onFailedToEnterRoom(ri);
//		}
//	},


	onSocketDisconnect: function(){
	   this.removeSessionObject();
	},


//	onModerationChange: function(msg) {
//		var newRoomInfo = this.onMembershipOrModerationChanged(msg),
//			isClassroom = false,//this.getClassroom().isClassroom(newRoomInfo),
//			chatViewFromWin = null,//this.getChatView(newRoomInfo),
//			rid = newRoomInfo ? newRoomInfo.getId() : null,
//			classroom = isClassroom ? this.getClassroom().getClassroomDown(rid, 'classroom-content') : null,
//			chatViewFromClass = classroom ? classroom.down('chat-view') : null;
//
//		if(!newRoomInfo) {
//			return;
//		}
//
//
//		if (this.isModerator(newRoomInfo)){
//			if (!isClassroom && chatViewFromWin) {
//				chatViewFromWin.openModerationPanel(newRoomInfo);
//				chatViewFromWin.addCls('moderator');
//			}
//			else if (isClassroom && chatViewFromClass){
//				this.getClassroom().openModerationPanel(newRoomInfo); //pass along so class can do something
//				chatViewFromClass.addCls('moderator');
//			}
//			else {
//				console.error('Could not find a chat view from a class or a window!');
//			}
//		}
//		else {
//			if (!isClassroom && chatViewFromWin) {
//				chatViewFromWin.closeModerationPanel(newRoomInfo);
//				chatViewFromWin.removeCls('moderator');
//			}
//			else if (isClassroom && chatViewFromClass){
//				this.getClassroom().closeModerationPanel(newRoomInfo); //pass along so class can do something
//				chatViewFromClass.removeCls('moderator');
//			}
//			else {
//				console.error('Could not find a chat view from a class or a window!');
//			}
//		}
//	},


	onMembershipOrModerationChanged: function(msg) {
		var newRoomInfo = ParseUtils.parseItems([msg])[0],
			oldRoomInfo = this.getRoomInfoFromSession(newRoomInfo.getId()),
            occupants = newRoomInfo.get('Occupants'),
            toast;

		if(newRoomInfo.get('Moderators').length === 0 && newRoomInfo.get('Moderated')) {
			console.log('Transient moderation change encountered, ignoring', newRoomInfo);
			return null;
		}

		this.sendChangeMessages(oldRoomInfo, newRoomInfo);
		this.updateRoomInfo(newRoomInfo);

        //if membership falls to just me, and we have a toast, DESTROY!
        if (occupants.length === 1 && occupants[0] === $AppConfig.userObject.get('Username')) {
            toast = Ext.ComponentQuery.query('toast[roomId='+IdCache.getIdentifier(newRoomInfo.getId())+']');
            if(toast && toast.length === 1){
                toast[0].close();
            }
        }


		return newRoomInfo; //for convinience chaining
	},


	onExitedRoom: function(room) {
		this.removeSessionObject(room.ID);
	},


//	onMessageForAttention: function(mid) {
//		var	id = IdCache.getIdentifier(mid),
//			cmp = Ext.ComponentQuery.query('[messageId='+id+']')[0],
//			win = (cmp ? cmp.up('window') : null),
//			msg = (cmp ? cmp.message : null);
//
//		UserRepository.getUser(msg.get('Creator'), function(u){
//			var name = u ? u.getName() : null,
//				i = u ? u.get('avatarURL'): null,
//				b, c;
//
//
//			if (!cmp || !msg) {
//				console.error('can not find messages');
//				return;
//			}
//
////			apply flagged class to message wherever it is.
//			if (cmp) {
//				cmp.addCls('flagged');
//			}
//
//			if (!win) {
//				b = this.getClassroom().getFlaggedMessagesButton();
//			}
//			else {
////				If we are here then we have a chat window, setup button there
//				b = win.query('button[action=flagged]')[0];
//			}
//
//			b.enable();
//			c = parseInt(b.getText(), 10);
//			b.setText(isNaN(c) ? 1 : c+1);
//
//			b.menu.add({
//				text:Ext.String.format('<b>{0}</b> - {1}', name,
//					Ext.String.ellipsis(msg.getBodyText(), 15, false)),
//				icon: i,
//				relatedCmp: cmp
//			});
//		}, this);
//	},

	onMessageError: function(errorObject, msg){
		var cid, win, log, view;

		if(!msg){
			//TODO what to do here, pop up something generic.
			console.error('No message object tied to error.  Dropping error', errorObject);
			return;
		}

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?

		cid = msg.get('ContainerId');
		win = this.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if(view){
			view.showError(errorObject);
		}
		else{
			console.warn('Error sending chat message but no chat view to show it in', msg, errorObject);
		}
	},

	onMessage: function(msg, opts) {
		var me = this, args = Array.prototype.slice.call(arguments),
			m = ParseUtils.parseItems([msg])[0],
			channel = m.get('channel'),
			cid = m.get('ContainerId'),
			w = this.getChatWindow(cid);

		if(!w) {
			this.rebuildWindow(cid, function(){
				me.onMessage.apply(me,args);
			});
			return;
		}

		this.channelMap[channel].call(this, m, opts||{});

		if(!w.minimized && !w.isVisible() && w.hasBeenAccepted() && channel !== 'STATE'){
			// NOTE: We don't want state channel notifications to trigger showing the window initially,
			// only when an actual message is sent should we do this.
			w.show();
		}
		else {
			w.notify();
		}
	},


//	setChatNotification: function(on) {
//		var cls = 'attention';
//
//		Ext.each(Ext.ComponentQuery.query('button[showChat]'), function(b){
//			if (on){b.addCls(cls);}
//			else{b.removeCls(cls);}
//		});
//	},


	onOccupantsChanged: function(newRoomInfo, peopleWhoLeft, peopleWhoArrived, modsLeft, modsAdded) {
		var win = this.getChatWindow(newRoomInfo.getId()),
			log = win ? win.down('chat-log-view[moderated=false]') : null;

		if(!win) {
			return;
		}
/*
		if (ClassroomUtils.isRoomEmpty(newRoomInfo)) {
			tab.disableChat();
		}
*/
		Ext.each(peopleWhoLeft, function(p){
			if (!isMe(p)){
				UserRepository.getUser(p, function(u){
					var name = u.getName();
					if(log){ log.addNotification(name + ' has left the chat...'); }
				}, this);
			}
		});

		Ext.each(peopleWhoArrived, function(p){
			if (!isMe(p)){
				UserRepository.getUser(p, function(u){
					var name = u.getName();
					if(log){ log.addNotification(name + ' entered the chat...'); }
				}, this);
			}
		});
	},


	onMessageDefaultChannel: function(msg, opts) {
		var cid, win, moderated, log, sender, room, isGroupChat;

		cid = msg.get('ContainerId');
		win = this.getChatWindow(cid);
		moderated = Boolean(opts && opts.hasOwnProperty('moderated'));
		sender = msg.get('Creator');
		room = this.getRoomInfoFromSession(cid);
		isGroupChat = room ? room.get('Occupants').length > 2 : false;

		log = win.down('chat-log-view[moderated=true]');
		win.down('chat-log-view[moderated='+moderated+']').addMessage(msg);
		this.updateChatState(sender, 'active', win, isGroupChat);
		if(!moderated && log) {
			log.removeMessage(msg);
		}
	},

	onReceiveStateChannel: function(msg){
		var cid = msg.get('ContainerId'),
			body = msg.get('body'),
			sender = msg.get('Creator'),
			win = this.getChatWindow(cid),
			isGroupChat = msg.get('recipients').length >= 2; //At least two other people.

		if(win && body){
			this.updateChatState(sender, body.state, win, isGroupChat);
		}
	},

	/**
	 *  We use this method to update the state of other chat participants.
	 *  Thus, it is responsible for updating the appropriate view,
	 *  but we don't keep track of other participants' state, because they manage it themselves.
	 */
	updateChatState: function(sender, state, win, isGroupChat){
		if(!win || !sender || sender === ""){ return; }
		var room = win.roomInfo,
			log = win.down('chat-log-view'), gutter =  win.down('chat-gutter'), inputStates,
			wasPreviouslyInactive = room.getRoomState(sender) === 'inactive';

		room.setRoomState(sender, state);
		console.log('Update chat state: set to ', state,' for ', sender);

		log.clearChatStatusNotifications();
		inputStates = room.getInputTypeStates();
		if(inputStates.length > 0){
			log.showInputStateNotifications(inputStates);
			// NOTE: if the user is typing that means he is active.
			if(!wasPreviouslyInactive){ return; }
			else{ state = 'active'; }
		}

		UserRepository.getUser(sender, function(u){
			var name = u.getName(), txt;
			if(isGroupChat){ gutter.setChatState(state, name); }
			else if(!isGroupChat && !isMe(sender)) {
				txt = Ext.String.ellipsis(name, 18, false) + ' is ' + state;
				win.setTitle(txt);
			}
		}, this);
	},

	startTrackingChatState: function( sender, room, w){
		if(!w){ w = me.openChatWindow(room); }
		this.updateChatState(sender, 'active', w, room.get('Occupants').length > 2);
	},

//	onMessageContentChannel: function(msg, opts) {
//		var win = this.getChatWindow(),
//			cid = msg.get('ContainerId'),
//			moderated = opts && opts.hasOwnProperty('moderated'),
//			tab,
//			log;
//
//		//if there's no window, then quit, classroom can take care of itself
//		if(!win) {
//			return;
//		}
//
//		tab = this.getChatView(cid);
//
//		if(!tab) {
//			console.warn('message received for tab which no longer exists', msg, cid, win.items);
//			return;
//		}
//
//		win.down('tabpanel').setActiveTab(tab);
//		tab.down('chat-log-view[moderated='+moderated+']').addContentMessage(msg);
//	},
//
//
//	onMessageMetaChannel: function(msg) {
//		var b = msg.get('body') || {},
//			a = b.action,
//			i = b.ntiid,
//			e,
//			r = this.getRoomInfoFromSession(msg.get('ContainerId')),
//			cv = this.getChatView(r);
//
//		if ('clearPinned' === a) {
//			cv.getPinnedMessageView().destroy();
//		}
//		else if('pin' === a ) {
//			e = cv.down('[messageId='+IdCache.getIdentifier(i)+']');
//			if (!e) {
//				console.warn('Could not find existing message with ID', i);
//				return;
//			}
//
//
//			cv.getPinnedMessageView().addMessage(e.message);
//		}
//	},
//
//
//	onMessagePollChannel: function(msg) {
//		console.log('POLL channel message not supported yet');
//	},
//
//
//	onModeratedMessage: function(msg) {
//		var m = ParseUtils.parseItems([msg])[0],
//			o = {moderated:true};
//
//		if (this.getClassroom().isClassroom(m.get('ContainerId'))) {
//			this.getClassroom().onMessage(m, o);
//			return;
//		}
//
//		this.onMessageDefaultChannel(m, o);
//	},


	onEnteredRoom: function(msg) {
        function isAcceptedOrTimedOut(){
            me.setRoomIdStatusAccepted(roomInfo.getId());
            w.accept(true);
	        me.startTrackingChatState(roomInfo.get('Creator'), roomInfo, w);
            if(isGroupChat){
                w.show();
            }
        }

        //because we are using this callback for both the button and window close callback.  There are 2 signatures,
        //we ignore one so we dont try to exit a room twice.
        function isDeclined(btnOrFalse){
            if ((btnOrFalse === false || btnOrFalse.label === 'decline') && w && !w.isDestroyed){
                me.leaveRoom(roomInfo);
                w.close();
            }
        }

		var me = this,
            roomInfo = msg && msg.isModel? msg : ParseUtils.parseItems([msg])[0],
            w,
            occupants = roomInfo.get('Occupants'),
            isGroupChat = (occupants.length > 2);

		me.putRoomInfoIntoSession(roomInfo);
		w = me.openChatWindow(roomInfo);

        //Rules for auto-accepting are getting complicated, I will enumerate them here:
        //1) if it's not a group chat, accept
        //2) regardless of group or not, if the room has been previously accepted, accept (like a refresh)
        //3) if you created it, accept
        if(!isGroupChat || me.isRoomIdAccepted(roomInfo.getId()) || isMe(roomInfo.get('Creator'))){
            isAcceptedOrTimedOut();
            return;
        }

        UserRepository.getUser(roomInfo.get('Creator'), function(u){
            //at this point, window has been created but not accepted.
            Toaster.makeToast({
                roomId: IdCache.getIdentifier(roomInfo.getId()),
                title: isGroupChat ? 'Group Chat...' : 'Chat Invitation...',
                message: isGroupChat
                    ? 'You\'ve been invited to chat with <span>'+(occupants.length-1)+'</span> friends.'
                    : '<span>'+ u.getName()+'</span> would like to chat.',
                iconCls: 'icons-chat-32',
                buttons: [
                    {
                        label: 'decline',
                        callback: isDeclined, //see comment about argument in callback
                        scope: me
                    },
                    {
                        label: 'accept',
                        callback: isAcceptedOrTimedOut,
                        scope: this
                    }
                ],
                callback: isDeclined,
                scope: me
            });
        });
	},


	putRoomInfoIntoSession: function(roomInfo){
		if (!roomInfo){Ext.Error.raise('Requires a RoomInfo object');}
		this.setSessionObject(roomInfo.getData(),roomInfo.getId());
	},


	getRoomInfoFromSession: function(key, json) {
		if (!key){Ext.Error.raise('Requires key to look up RoomInfo');}

		json = json || this.getSessionObject(key);

		if (json){
			try {
				return new NextThought.model.RoomInfo(json);
			}
			catch(e) {
				console.warn('Item in session storage is not a roomInfo', json);
			}
		}
		return null; //not there
	},


	getAllRoomInfosFromSession: function(){
		var roomInfos = [], ri, key, chats;

		chats = this.getSessionObject();

		for (key in chats) {
            if(chats.hasOwnProperty(key)){
	            if (key && key !== 'roomIdsAccepted'){
	                ri = this.getRoomInfoFromSession(key,chats[key]);
	                if (ri){roomInfos.push(ri);}
	            }
            }
		}
		return roomInfos;
	},

    setRoomIdStatusAccepted: function(id){
	    var key = 'roomIdsAccepted',
            status = this.getSessionObject(key);

        status[id] = true;

	    this.setSessionObject(status,key);
    },

    deleteRoomIdStatusAccepted: function(id){
        var key = 'roomIdsAccepted',
            status = this.getSessionObject(key);

        delete status[id];

	    this.setSessionObject(status,key);
    },


    isRoomIdAccepted: function(id){
        return Boolean((this.getSessionObject('roomIdsAccepted') || {})[id]);
    },


	/**
	 *
	 * @param [key] Optional sub-key
	 * @return {*}
	 */
	getSessionObject: function(key){
		var o = Ext.JSON.decode(sessionStorage.getItem('chats')||'{}');
		return o[key] || o;
	},


	/**
	 *
	 * @param o {Object} Value to put into session storage.
	 * @param [key] {String} Optional key. If present, `o` is assumed to be the new value at the `key` instead of
	 *              the whole session object.
	 */
	setSessionObject: function(o,key){
		var leaf = o;
		if(!Ext.isEmpty(key)){
			o = this.getSessionObject();
			o[key] = leaf;
		}
		sessionStorage.setItem('chats',Ext.JSON.encode(o));
	},


	/**
	 *
	 * @param [key] {String}
	 */
	removeSessionObject: function(key){
		if(!Ext.isEmpty(key)){
			var o = this.getSessionObject();
			delete o[key];
			this.setSessionObject(o,key);
			return;
		}
		sessionStorage.removeItem('chats');
	}

});
