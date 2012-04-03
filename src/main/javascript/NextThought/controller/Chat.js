Ext.define('NextThought.controller.Chat', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.util.ParseUtils',
		'NextThought.proxy.Socket',
		'NextThought.view.modes.Classroom',
		'NextThought.util.ClassroomUtils',
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
		'widgets.chat.LogEntryPinned',
		'widgets.chat.PinnedMessageView',
		'widgets.chat.Friends',
		'widgets.chat.FriendEntry',
		'widgets.classroom.ScriptEntry',
		'widgets.classroom.ScriptLog',
		'windows.NoteEditor'
	],

	refs: [
		{ ref: 'chatWindow', selector: 'chat-window'},
		{ ref: 'classroomMode', selector: 'classroom-mode-container'}
	],


	init: function() {
		this.activeRooms = {};

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
			'chat_roomModerationChanged' : function(){me.onMembershipOrModerationChanged.apply(me, arguments);},
			'chat_presenceOfUserChangedTo' : function(user, presence){UserRepository.presenceChanged(user, presence);},
			'chat_recvMessage': function(){me.onMessage.apply(me, arguments);},
			'chat_recvMessageForAttention' : function(){me.onMessageForAttention.apply(me, arguments);},
			'chat_recvMessageForModeration' : function(){me.onModeratedMessage.apply(me, arguments);},
			'chat_recvMessageForShadow' : function(){me.onMessage.apply(me, arguments);},
			'chat_failedToEnterRoom' : function(){me.onFailedToEnterRoom.apply(me, arguments);}
		});

		this.control({
			'chat-window splitbutton menuitem': {
				'click': this.flaggedMenuItemClicked
			},
			'chat-window splitbutton[action=flagged]': {
				'click' : this.flaggedButtonClicked
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
					if (!cmp.disableExitRoom) {
						this.leaveRoom(cmp.roomInfo);
					}
				}
			},

			'chat-log-view':{'approve': function(ids){this.approveMessages(ids);}},
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
				'reply-whisper': this.replyWhisper,
				'pin': this.pinMessage
			},
			'chat-content-log-entry' : {
				'click': this.contentEntryClicked
			},
			'chat-log-entry-moderated' : {
				'reply-public': this.replyPublic,
				'reply-whisper': this.replyWhisper,
				'pin': this.pinMessage
			},
			'chat-pinned-message-view toolbar button' : {
				'click': this.clearPinnedMessages
			},
			'script-entry' : {
				'script-to-chat': this.send
			}

		},{});
	},

	/* UTILITY METHODS */
	getClassroom: function(){
		return this.getController('Classroom');
	},

	getChatView: function(roomInfo) {
		var id = IdCache.getIdentifier(roomInfo.getId());
		return Ext.ComponentQuery.query('chat-view[roomId='+id+']')[0];
	},

	existingRoom: function(users, options) {
		//Add ourselves to this list
		var key, ri,
			allUsers = Ext.Array.unique(users.slice().concat($AppConfig.userObject.getId()));

		if(options){
			return null;
		}

		//Check to see if a room with these users already exists, and use that.
		for (key in this.activeRooms) {
			if (this.activeRooms.hasOwnProperty(key)) {
				ri = this.activeRooms[key];
				if (Globals.arrayEquals(ri.get('Occupants'), allUsers)) {
					return ri;
				}
			}
		}
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
		options.ContainerId = options.ContainerId || LocationProvider.currentNTIID;
		if (!options.ContainerId){
			//TODO: figure out what to do when there's no container ID?
			console.error('Chat room entered and no current location is set, this chat will not be visable as a transcript.');
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
						continue;
					}
				}

				if(!UserRepository.isOnline(users[k])) {
					delete users[k];
				}
			}
		}

		users = Ext.Array.clean(users);

		ri = this.existingRoom(users,options);
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


	/**
	 *
	 * @param roomInfo
	 * @param [success] - if you ask for moderation, and the server makes you one, this method
	 *                    will be called.
	 */
	moderateChat: function(roomInfo, success) {
		var me = this;
		//fired from both classroom and regular chat window
		Socket.emit('chat_makeModerated', roomInfo.getId(), true,
			function(ri){
				var obj = ParseUtils.parseItems(ri)[0];
				if(success && Ext.Array.contains(obj.get('Moderators'), $AppConfig.username)){
					//user is in moderators list, do something
					success.call(this);
				}
				me.updateRoomInfo(obj);
			}
		);
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
		var room = f.roomInfo || f.up('chat-view').roomInfo,
			val = f.getValue();

		if (Ext.isEmpty(val)) {
			return;
		}

		this.postMessage(room, val, mid, channel, recipients);


		f.setValue('');
		f.focus();
	},

	classroom: function(f, mid, channel, recipients) {
		var cv = f.up('chat-view'),
			room = cv.roomInfo,
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

		//mode to classroom, call showClassroom on Classroom mode?
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


	moderateClicked: function(cmp){
		var me=this,
			chatViewFromWin = cmp.up('chat-view'),
			classroom = cmp.up('classroom-content'),
			chatViewFromClass = classroom ? classroom.down('chat-view') : null,
			roomInfo = chatViewFromWin ? chatViewFromWin.roomInfo :
							chatViewFromClass ? chatViewFromClass.roomInfo : null;


		this.moderateChat(roomInfo, function(){
			if (chatViewFromWin) {
				chatViewFromWin.openModerationPanel();
			}
			else {
				chatViewFromClass.initOccupants(true);
			}

			if (chatViewFromWin){chatViewFromWin.addCls('moderator');}
			if (chatViewFromClass){
				me.getClassroom().onModerateClicked(cmp); //pass along so class can do something
				chatViewFromClass.addCls('moderator');
			}
		});
	},

	flagMessagesTo: function(user, dropData){
		var u = [], m = [];
		u.push(user.getId());
		m.push(dropData.data.NTIID);
		Socket.emit('chat_flagMessagesToUsers', m, u);
	},


	updateRoomInfo: function(ri) {
		console.log('room info updated, old', this.activeRooms[ri.getId()], 'new', ri);
		if (this.activeRooms.hasOwnProperty(ri.getId())) {
			this.activeRooms[ri.getId()].fireEvent('changed', ri);
		}

		this.activeRooms[ri.getId()] = ri;
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


	openChatWindow: function(){
		(this.getChatWindow() || Ext.create('widget.chat-window')).show();
		//turn off any notifications
		this.setChatNotification(false);
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
		if (!room) {
			return;
		}

		delete this.activeRooms[room.getId()];

		Socket.emit('chat_exitRoom', room.getId());
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
		recipients.add($AppConfig.userObject.getId(), 1);

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
			ri = this.activeRooms[m.get('ContainerId')];
		this.postMessage(ri, {'channel': m.get('channel'), 'action': 'pin', 'ntiid': m.getId()}, null, 'META');
	},

	clearPinnedMessages: function(btnCmp) {
		var ri = btnCmp.up('chat-view').roomInfo;
		this.postMessage(ri, {'channel': 'DEFAULT', 'action': 'clearPinned'}, null, 'META');
	},

	/* SERVER EVENT HANDLERS*/

	onFailedToEnterRoom: function(ri){
		if (this.getClassroom().isClassroom(ri)) {
			this.getClassroom().onFailedToEnterRoom(ri);
		}
	},

	onSocketDisconnect: function(){
	   this.activeRooms = {};
	},

	onMembershipOrModerationChanged: function(msg) {
		var newRoomInfo = ParseUtils.parseItems([msg])[0];
		var oldRoomInfo = this.activeRooms[newRoomInfo.getId()];
		this.sendChangeMessages(oldRoomInfo, newRoomInfo);
		this.updateRoomInfo(newRoomInfo);	},


	onExitedRoom: function(room) {
		if (this.activeRooms.hasOwnProperty(room.ID)) {
			this.activeRooms[room.ID].fireEvent('left-room');
			delete this.activeRooms[room.ID];
		}
	},

	onMessageForAttention: function(mid) {
		var id = IdCache.getIdentifier(mid),
			cmp = Ext.ComponentQuery.query('[messageId=' + id + ']')[0],
			win = cmp ? cmp.up('window') : null,
			msg = cmp ? cmp.message : null,
			u = msg ? UserRepository.getUser(msg.get('Creator')) : null,
			name = u ? u.get('alias') || u.get('realname') : null,
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
					Ext.String.ellipsis(AnnotationUtils.getBodyTextOnly(msg), 15)),
			icon: i,
			relatedCmp: cmp
		});
	},

	onMessage: function(msg, opts) {
		var m = ParseUtils.parseItems([msg])[0],
			channel = m.get('channel'),
			w;

		if (this.getClassroom().isClassroom(m) &&
			this.getClassroom().onMessage(m, {})){
			return;
		}

		this.channelMap[channel].call(this, m, opts||{});

		//notify if window is closed:
		w = this.getChatWindow();
		if (!w.isVisible()) {
			this.setChatNotification(true);
		}
	},


	setChatNotification: function(on) {
		var cols = Ext.ComponentQuery.query('leftColumn'),
			b,
			cls = 'attention';

		Ext.each(cols, function(c){
			b = c.down('button[showChat]');
			if (b) {
				if (on){b.addCls(cls);}
				else{b.removeCls(cls);}
			}
		});
	},


	onOccupantsChanged: function(newRoomInfo, peopleWhoLeft, peopleWhoArrived, modsLeft, modsAdded) {
		var win = this.getChatWindow(),
			id = newRoomInfo.getId(),
			r = IdCache.getIdentifier(id),
			tab, view;

		if (this.getClassroom().isClassroom({ContainerId: id})) {
			this.getClassroom().onOccupantsChanged(peopleWhoLeft, peopleWhoArrived);
			this.getClassroom().onModsChanged(modsLeft, modsAdded);
			return;
		}

		if(!win) {
			return;
		}

		tab = win.down('chat-view[roomId=' + r + ']');
		tab.setTitle(ClassroomUtils.generateOccupantsString(newRoomInfo));
		if (ClassroomUtils.isRoomEmpty(newRoomInfo)) {
			tab.disableChat();
		}
		view = tab.down('chat-log-view');
		view.occupantsChanged(peopleWhoLeft, peopleWhoArrived);
		view.modsChanged(modsLeft, modsAdded);
	},


	onMessageDefaultChannel: function(msg, opts) {
		var win = this.getChatWindow(),
			r = IdCache.getIdentifier(msg.get('ContainerId')),
			moderated = opts && opts.hasOwnProperty('moderated'),
			tab,
			log;

		if(!win) {
			return;
		}

		tab = win.down('chat-view[roomId=' + r + ']');
		log = tab ? tab.down('chat-log-view[moderated=true]') : null;

		if(!tab) {
			console.warn('message received for tab which no longer exists', msg, r, win.items);
			return;
		}

		win.down('tabpanel').setActiveTab(tab);
		tab.down('chat-log-view[moderated='+moderated+']').addMessage(msg);

		if(!moderated && log) {
			log.removeMessage(msg);
		}
	},


	onMessageContentChannel: function(msg, opts) {
		console.log('got some content data', arguments);


		var win = this.getChatWindow(),
			r = IdCache.getIdentifier(msg.get('ContainerId')),
			moderated = opts && opts.hasOwnProperty('moderated'),
			tab,
			log;

		//if there's no window, then quit, classroom can take care of itself
		if(!win) {
			return;
		}

		tab = win.down('chat-view[roomId=' + r + ']');

		if(!tab) {
			console.warn('message received for tab which no longer exists', msg, r, win.items);
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
			r = this.activeRooms[msg.get('ContainerId')],
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

			cv.getPinnedMessageView().add(
				{ xtype:'chat-log-entry-pinned', message: e.message}
			);

		}
	},


	onMessagePollChannel: function(msg) {
		console.log('POLL channel message not supported yet');
	},

	onModeratedMessage: function(msg) {
		var m = ParseUtils.parseItems([msg])[0],
			o = {moderated:true};

		if (this.getClassroom().isClassroom(m)) {
			this.getClassroom().onMessage(m, o);
			return;
		}

		this.onMessageDefaultChannel(m, o);
	},

	onEnteredRoom: function(msg) {
		var roomInfo = msg && msg.isModel? msg : ParseUtils.parseItems([msg])[0],
			existingRoom;

		//double check the roominfo.  if it's empty, we probably shouldn't have gotten this far...
		//...but just in case, make sure we don't confuse the user and open tabs/etc
		if (ClassroomUtils.isRoomEmpty(roomInfo)) {
			console.warn('chat room ' + roomInfo.getId()+ ' entered but is empty, exiting room', roomInfo);
			this.leaveRoom(roomInfo);
			return;
		}

		if (this.activeRooms.hasOwnProperty(roomInfo.getId())) {
			console.warn('room already exists, all rooms/roomInfo', this.activeRooms, roomInfo);
		}

		existingRoom = this.existingRoom(roomInfo.get('Occupants'));
		if (existingRoom) {
			existingRoom.fireEvent('changed', roomInfo);
			this.leaveRoom(existingRoom);
		}

		this.activeRooms[roomInfo.getId()] = roomInfo;

		if (this.getClassroom().isClassroom(roomInfo)) {
			this.getClassroom().onEnteredRoom(roomInfo);
		}
		else{
			this.openChatWindow();
			this.getChatWindow().addNewChat(roomInfo);
			this.getChatWindow().doComponentLayout();
		}
	}

});
