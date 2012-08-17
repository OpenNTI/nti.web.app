Ext.define('NextThought.controller.Chat', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.cache.IdCache',
		'NextThought.util.Annotations',
		'NextThought.util.Classrooms',
		'NextThought.util.Parsing',
		'NextThought.proxy.Socket'
	],


	models: [
		'FriendsList',
		'MessageInfo',
		'RoomInfo'
	],


	views: [
		'chat.Window'
	],


	refs: [
		{ ref: 'classroomMode', selector: 'classroom-view-container'}
	],


	init: function() {
		var me = this;

		//table of behavious based on channel
		this.channelMap = {
			'CONTENT': this.onMessageContentChannel,
			'POLL': this.onMessagePollChannel,
			'META': this.onMessageMetaChannel,
			'DEFAULT': this.onMessageDefaultChannel,
			'WHISPER' : this.onMessageDefaultChannel
		};

		Socket.register({
			'disconnect': function(){me.onSocketDisconnect.apply(me, arguments);},
			'serverkill': function(){me.onSocketDisconnect.apply(me, arguments);},
			'chat_enteredRoom': function(){me.onEnteredRoom.apply(me, arguments);},
			'chat_exitedRoom' : function(){me.onExitedRoom.apply(me, arguments);},
			'chat_roomMembershipChanged' : function(){me.onMembershipOrModerationChanged.apply(me, arguments);},
			'chat_roomModerationChanged' : function(){me.onModerationChange.apply(me, arguments);},
			'chat_presenceOfUserChangedTo' : function(user, presence){UserRepository.presenceChanged(user, presence);},
			'chat_recvMessage': function(){me.onMessage.apply(me, arguments);},
			'chat_recvMessageForAttention' : function(){me.onMessageForAttention.apply(me, arguments);},
			'chat_recvMessageForModeration' : function(){me.onModeratedMessage.apply(me, arguments);},
			'chat_recvMessageForShadow' : function(){me.onMessage.apply(me, arguments);},
			'chat_failedToEnterRoom' : function(){me.onFailedToEnterRoom.apply(me, arguments);}
		});

		this.control({

			'noteeditor button[action=send]':{ 'click': this.sendComposed },

			'chat-log-view':{'approve': function(ids){this.approveMessages(ids);}},
			'chat-log-view button[action]':{'click': this.toolClicked},
			'chat-log-view tool[action]':{'click': this.toolClicked},

			'chat-view chat-entry' : {
				//'classroom': this.classroom,
				//'compose': this.compose,
				'send': this.send
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
					Socket.emit('chat_enterRoom', {NTIID: ri.getId(), Occupants: o});
				}
			},

			'script-entry' : {
				'script-to-chat': this.send
			}

		},{});

		//handle some events on session, open existing chat rooms and clear the session on logout.
		this.application.on('session-ready', this.onSessionReady, this);
		this.application.on('session-closed', function(){sessionStorage.clear();}, this);
	},


	onSessionReady: function(){
		//open any rooms we were currently involved in
		var me = this,
			roomInfos = me.getAllRoomInfosFromSessionStorage(),
			w;
		Ext.each(roomInfos, function(ri) {
			me.onEnteredRoom(ri);
			w = me.getChatWindow(ri);
			w.show();
			w.minimize();
		});

	},


	/* UTILITY METHODS */
	getClassroom: function(){
		return this.getController('Classroom');
	},


	getChatWindow: function(r) {
		if (!r){return null;}

		var rIsString = (typeof(r) === 'string'),
			id = IdCache.getIdentifier(rIsString ? r : r.getId());

		return Ext.ComponentQuery.query('chat-window[roomInfoHash='+id+']')[0];
	},


	isModerator: function(ri) {
		return Ext.Array.contains(ri.get('Moderators'), $AppConfig.username);
	},


	/**
	 * Check to see if a room already exists.  A room exists when any of the following conditions are met, in this order:
	 *1) if there's a roomId sent.  there must be an existing roomId in the active rooms object.
	 *2) if no roomId is sent, then look for a room with the same constituants, that room must not be a group/class.
	 *
	 * @param users - list of users
	 * @param roomId - roomid
	 * @param options - options
	 * @return {*}
	 */
	existingRoom: function(users, roomId, options) {
		//Add ourselves to this list
		var key, ri,
			allUsers = Ext.Array.unique(users.slice().concat($AppConfig.username));

		if(options && options.ContainerId && !roomId){
			roomId = options.ContainerId;
		}

		var i, rInfo;
		for (i = 0; i < sessionStorage.length; i++) {
			rInfo = this.getRoomInfoFromSessionStorage(sessionStorage.key(i));
			if (rInfo){
				if (roomId && roomId === rInfo.getId()){
					return rInfo;
				}
				else if (!ClassroomUtils.isClassroomId(rInfo.getId())) {
					if( Ext.Array.difference(rInfo.get('Occupants'),allUsers).length === 0
					&&	Ext.Array.difference(allUsers,rInfo.get('Occupants')).length === 0 ){
						return rInfo;
					}
				}
			}
		}

		return null;
	},


	postMessage: function(room, message, replyTo, channel, recipients) {

		if(typeof message === 'string') {
			message = [message];
		}

		var m = {ContainerId: room.getId(), body: message, Class: 'MessageInfo'};

		if (replyTo) {
			m.inReplyTo = replyTo;
		}
		if (channel) {
			m.channel = channel;
		}
		if (recipients) {
			m.recipients = recipients;
		}

		Socket.emit('chat_postMessage', m);
	},


	approveMessages: function(messageIds){
		Socket.emit('chat_approveMessages', messageIds);
	},


	enterRoom: function(usersOrList, options) {
		options = options || {};
		var users = [], k, ri, roomCfg;

		//chat rooms need a containerId, make sure we add these, let them get overridden later if it's a persistant room
		options.ContainerId = options.ContainerId || LocationProvider.currentNTIID || Globals.CONTENT_ROOT;
		if (!options.ContainerId){
			delete options.ContainerId;
		}

		if (usersOrList.get && usersOrList.get('friends')) {
			options.ContainerId = usersOrList.get('NTIID');
		}
		else if (!Ext.isArray(usersOrList)) {
			users = [usersOrList];
		}
		else {
			users = usersOrList;
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

		ri = this.existingRoom(users, options.ContainerId ? options.ContainerId : null, options);
		if (ri) {
			this.onEnteredRoom(ri);
		}
		else { //If we get here, there were no existing rooms, so create a new one.
			roomCfg = {'Occupants': users};

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


	/* CLIENT EVENTS */
	compose: function(textField, replyToId, channel, recipients){
		var room = ClassroomUtils.getRoomInfoFromComponent(textField),
			record = Ext.create('NextThought.model.MessageInfo',{
			inReplyTo: replyToId,
			channel: channel,
			recipients: recipients
		}),
			win = Ext.widget({
				xtype: 'noteeditor',
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
		var room = ClassroomUtils.getRoomInfoFromComponent(f),
			val = f.getValue();

		if (!room || Ext.isEmpty(val)) {
			console.error('Cannot send message, room', room, 'values', val);
			return;
		}

		this.postMessage(room, val, mid, channel, recipients);

		f.focus();
	},


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


	flaggedMenuItemClicked: function(mi) {
		this.showMessage(mi.relatedCmp);
	},


	flaggedButtonClicked: function(btn){
		var i = btn.menu.items,
			c = (btn.lastAction+1) % i.getCount();

		btn.lastAction = isNaN(c) ? 0 : c;

		this.flaggedMenuItemClicked(i.getAt(btn.lastAction));
	},


	toolClicked: function(field) {
		var a = field.action.toLowerCase(),
			b = field.up('chat-log-view[moderated=true]');

		if (!a || !b){
			console.warn('Skipping action, no action specified or no logs', a, b);
			return;
		}

		if(Ext.isFunction(b[a])){
			b[a].call(b);
		}
		else {
			console.warn('component does not implement the function:',a);
		}
	},


	contentEntryClicked: function(entry) {
		var loc = entry.location;

		if (!loc){return;}

		Ext.getCmp('reader').activate();
		LocationProvider.setLocation(loc.NTIID);
	},


	/**
	 * Someone clicked a moderation button.  If he is currently a moderator, he's requestion
	 * to relinquish control.  If he's not a moderator, then he wants to be.
	 *
	 * @param cmp - the button
	 */
	moderateClicked: function(cmp){
		var roomInfo = ClassroomUtils.getRoomInfoFromComponent(cmp),
			shouldModerate = this.isModerator(roomInfo) ? false : true;

		console.log('moderate clicked, moderation value', shouldModerate);
		Socket.emit('chat_makeModerated', roomInfo.getId(), shouldModerate);
	},


	flagMessagesTo: function(user, dropData){
		var u = [], m = [];
		u.push(user.getId());
		m.push(dropData.data.NTIID);
		Socket.emit('chat_flagMessagesToUsers', m, u);
	},


	updateRoomInfo: function(ri) {
		var ro = this.getRoomInfoFromSessionStorage(ri.getId());
		if (ro) {
			ro.fireEvent('changed', ri);
		}
		this.putRoomInfoIntoSessionStorage(ri);
	},


	sendChangeMessages: function(oldRoomInfo, newRoomInfo) {
		var oldOccupants = oldRoomInfo.get('Occupants'),
			newOccupants = newRoomInfo.get('Occupants'),
			oldMods = oldRoomInfo.get('Moderators'),
			newMods = newRoomInfo.get('Moderators'),
			left = Ext.Array.difference(oldOccupants, newOccupants),
			added = Ext.Array.difference(newOccupants, oldOccupants),
			leftMods = Ext.Array.difference(oldMods, newMods),
			addedMods = Ext.Array.difference(newMods, oldMods);

		this.onOccupantsChanged(newRoomInfo, left, added, leftMods, addedMods);
	},


	openChatWindow: function(roomInfo){
		var w = this.getChatWindow(roomInfo);
		if(!w){
			w = Ext.widget({
				xtype: 'chat-window',
				roomInfo: roomInfo
			});
		}

		if(isMe(roomInfo.get('Creator'))){
			w.show();
		}
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


	occupantClicked: function(u) {
		//open a new tab to chat with this user...
		this.enterRoom(u);
	},


	shadowClicked: function(cmp,user) {
		var u = [],
			rid = ClassroomUtils.getRoomInfoIdFromComponent(cmp);

		if (!rid || !user) {
			console.error('Cannot execute shadow request, cmp', cmp, 'user', user);
			return;
		}

		u.push(user.getId());
		Socket.emit('chat_shadowUsers',rid, u);
	 },


	leaveRoom: function(room){
		if (!room) {
			return;
		}

		if (this.isModerator(room)) {
			console.log('leaving room but I\'m a moderator, relinquish control');
			Socket.emit('chat_makeModerated', room.getId(), false,
				function(){
					//unmoderate called, now exit
					console.log('unmoderated, now exiting room');
					Socket.emit('chat_exitRoom', room.getId());
				}
			);
		}
		else {
			//im not a moderator, just leave
			Socket.emit('chat_exitRoom', room.getId());
		}
	},


	replyPublic: function(msgCmp) {
		msgCmp.showReplyToComponent().setChannel('DEFAULT');
	},


	replyWhisper: function(msgCmp) {
		var message = msgCmp.message,
			w = msgCmp.up('chat-window'),
			recipients = new Ext.util.HashMap(),
			r,m;

		recipients.add(message.get('Creator'), 1);
		recipients.add($AppConfig.username, 1);

		while(w && message && message.get('inReplyTo')){
			r = IdCache.getIdentifier('inReplyTo');
			m = w.down(Ext.String.format('*[messageId={1}]', r));

			if(!m || !m.message) {
				break;
			}

			message = m.message;
			recipients.add(message.get('Creator'), 1);
		}

		msgCmp.showReplyToComponent().setChannel('WHISPER', recipients.getKeys());
	},


	pinMessage: function(msgCmp) {
		var m = msgCmp.message,
			ri = this.getRoomInfoFromSessionStorage(m.get('ContainerId'));
		this.postMessage(ri, {'channel': m.get('channel'), 'action': 'pin', 'ntiid': m.getId()}, null, 'META');
	},

	clearPinnedMessages: function(btnCmp) {
		var ri = ClassroomUtils.getRoomInfoFromComponent(btnCmp);
		this.postMessage(ri, {'channel': 'DEFAULT', 'action': 'clearPinned'}, null, 'META');
	},


	/* SERVER EVENT HANDLERS*/


	onFailedToEnterRoom: function(ri){
		if (this.getClassroom().isClassroom(ri)) {
			this.getClassroom().onFailedToEnterRoom(ri);
		}
	},


	onSocketDisconnect: function(){
	   sessionStorage.clear();
	},


	onModerationChange: function(msg) {
		var newRoomInfo = this.onMembershipOrModerationChanged(msg),
			isClassroom = this.getClassroom().isClassroom(newRoomInfo),
			chatViewFromWin = this.getChatView(newRoomInfo),
			rid = newRoomInfo ? newRoomInfo.getId() : null,
			classroom = this.getClassroom().getClassroomDown(rid, 'classroom-content'),
			chatViewFromClass = classroom ? classroom.down('chat-view') : null;

		if(!newRoomInfo) {
			return;
		}


		if (this.isModerator(newRoomInfo)){
			if (!isClassroom && chatViewFromWin) {
				chatViewFromWin.openModerationPanel(newRoomInfo);
				chatViewFromWin.addCls('moderator');
			}
			else if (isClassroom && chatViewFromClass){
				this.getClassroom().openModerationPanel(newRoomInfo); //pass along so class can do something
				chatViewFromClass.addCls('moderator');
			}
			else {
				console.error('Could not find a chat view from a class or a window!');
			}
		}
		else {
			if (!isClassroom && chatViewFromWin) {
				chatViewFromWin.closeModerationPanel(newRoomInfo);
				chatViewFromWin.removeCls('moderator');
			}
			else if (isClassroom && chatViewFromClass){
				this.getClassroom().closeModerationPanel(newRoomInfo); //pass along so class can do something
				chatViewFromClass.removeCls('moderator');
			}
			else {
				console.error('Could not find a chat view from a class or a window!');
			}
		}
	},


	onMembershipOrModerationChanged: function(msg) {
		var newRoomInfo = ParseUtils.parseItems([msg])[0],
			oldRoomInfo = this.getRoomInfoFromSessionStorage(newRoomInfo.getId());

		if(newRoomInfo.get('Moderators').length === 0 && newRoomInfo.get('Moderated')) {
			console.log('Transient moderation change encountered, ignoring', newRoomInfo);
			return null;
		}

		this.sendChangeMessages(oldRoomInfo, newRoomInfo);
		this.updateRoomInfo(newRoomInfo);
		return newRoomInfo; //for convinience chaining
	},


	onExitedRoom: function(room) {
		sessionStorage.removeItem(room.ID);
	},


	onMessageForAttention: function(mid) {
		var	id = IdCache.getIdentifier(mid);
		var cmp = Ext.ComponentQuery.query('[messageId='+id+']')[0];
		var win = (cmp ? cmp.up('window') : null),
			msg = (cmp ? cmp.message : null);

		UserRepository.getUser(msg.get('Creator'), function(users){
			var u = users[0],
				name = u ? u.getName() : null,
				i = u ? u.get('avatarURL'): null,
				b, c;


			if (!cmp || !msg) {
				console.error('can not find messages');
				return;
			}

			//apply flagged class to message wherever it is.
			if (cmp) {
				cmp.addCls('flagged');
			}

			if (!win) {
				b = this.getController('Classroom').getFlaggedMessagesButton();
			}
			else {
				//If we are here then we have a chat window, setup button there
				b = win.query('button[action=flagged]')[0];
			}

			b.enable();
			c = parseInt(b.getText(), 10);
			b.setText(isNaN(c) ? 1 : c+1);

			b.menu.add({
				text:Ext.String.format('<b>{0}</b> - {1}', name,
					Ext.String.ellipsis(msg.getBodyText(), 15, false)),
				icon: i,
				relatedCmp: cmp
			});
		}, this);
	},


	onMessage: function(msg, opts) {
		var me = this, args = Array.prototype.slice.call(arguments);
		var m = ParseUtils.parseItems([msg])[0],
			channel = m.get('channel'),
			cid = m.get('ContainerId'),
			w = this.getChatWindow(cid);

		if (this.getClassroom().isClassroom(m) &&
			this.getClassroom().onMessage(m, {})){
			return;
		}


		if(!w) {
			this.rebuildWindow(cid, function(){
				me.onMessage.apply(me,args);
			});
			return;
		}

		this.channelMap[channel].call(this, m, opts||{});

		if(!w.minimized){
			w.show();
		}
		else {
			w.notify();
		}
	},


	setChatNotification: function(on) {
		var cls = 'attention';

		Ext.each(Ext.ComponentQuery.query('button[showChat]'), function(b){
			if (on){b.addCls(cls);}
			else{b.removeCls(cls);}
		});
	},


	onOccupantsChanged: function(newRoomInfo, peopleWhoLeft, peopleWhoArrived, modsLeft, modsAdded) {
		var win = this.getChatWindow(newRoomInfo.getId()),
			log = win.down('chat-log-view[moderated=false]');

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
					var name = u[0].get('alias');
					log.addNotification(name + ' has left the chat...');
				}, this);
			}
		});

		Ext.each(peopleWhoArrived, function(p){
			if (!isMe(p)){
				UserRepository.getUser(p, function(u){
					var name = u[0].get('alias');
					log.addNotification(name + ' entered the chat...');
				}, this);
			}
		});
	},


	onMessageDefaultChannel: function(msg, opts) {
		var	cid = msg.get('ContainerId');
		var win = this.getChatWindow(cid),
			moderated = Boolean(opts && opts.hasOwnProperty('moderated')),
			log;

		log = win.down('chat-log-view[moderated=true]');
		win.down('chat-log-view[moderated='+moderated+']').addMessage(msg);

		if(!moderated && log) {
			log.removeMessage(msg);
		}
	},


	onMessageContentChannel: function(msg, opts) {
		var win = this.getChatWindow(),
			cid = msg.get('ContainerId'),
			moderated = opts && opts.hasOwnProperty('moderated'),
			tab,
			log;

		//if there's no window, then quit, classroom can take care of itself
		if(!win) {
			return;
		}

		tab = this.getChatView(cid);

		if(!tab) {
			console.warn('message received for tab which no longer exists', msg, cid, win.items);
			return;
		}

		win.down('tabpanel').setActiveTab(tab);
		tab.down('chat-log-view[moderated='+moderated+']').addContentMessage(msg);
	},


	onMessageMetaChannel: function(msg) {
		var b = msg.get('body') || {},
			a = b.action,
			i = b.ntiid,
			e,
			r = this.getRoomInfoFromSessionStorage(msg.get('ContainerId')),
			cv = this.getChatView(r);

		if ('clearPinned' === a) {
			cv.getPinnedMessageView().destroy();
		}
		else if('pin' === a ) {
			e = cv.down('[messageId='+IdCache.getIdentifier(i)+']');
			if (!e) {
				console.warn('Could not find existing message with ID', i);
				return;
			}


			cv.getPinnedMessageView().addMessage(e.message);
		}
	},


	onMessagePollChannel: function(msg) {
		console.log('POLL channel message not supported yet');
	},


	onModeratedMessage: function(msg) {
		var m = ParseUtils.parseItems([msg])[0],
			o = {moderated:true};

		if (this.getClassroom().isClassroom(m.get('ContainerId'))) {
			this.getClassroom().onMessage(m, o);
			return;
		}

		this.onMessageDefaultChannel(m, o);
	},


	onEnteredRoom: function(msg) {
		var roomInfo = msg && msg.isModel? msg : ParseUtils.parseItems([msg])[0];
		this.putRoomInfoIntoSessionStorage(roomInfo);
		this.openChatWindow(roomInfo);
	},


	putRoomInfoIntoSessionStorage: function(roomInfo){
		if (!roomInfo){Ext.Error.raise('Requires a RoomInfo object');}
		var key = roomInfo.getId();
		sessionStorage.setItem(key, Ext.JSON.encode(roomInfo.getData()));
	},


	getRoomInfoFromSessionStorage: function(key) {
		if (!key){Ext.Error.raise('Requires key to look up RoomInfo');}
		var jsonString = sessionStorage.getItem(key);
		if (jsonString){
			try {
				return Ext.create('NextThought.model.RoomInfo', Ext.JSON.decode(jsonString));
			}
			catch(e) {
				console.warn('Item in session storage is not a roomInfo', jsonString);
			}
		}
		return null; //not there
	},


	getAllRoomInfosFromSessionStorage: function(){
		var i, roomInfos = [], ri;
		for (i = 0; i < sessionStorage.length; i++) {
			ri = this.getRoomInfoFromSessionStorage(sessionStorage.key(i));
			if (ri){roomInfos.push(ri);}
		}
		return roomInfos;
	}

});
