Ext.define('NextThought.app.chat.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.login.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.model.PresenceInfo',
		'NextThought.util.Parsing',
		'NextThought.model.MessageInfo'
	],

	availableForChat: true,

	constructor: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		var store = this.ChatStore;

		this.channelMap = {
			'DEFAULT': this.onMessageDefaultChannel.bind(this),
			'WHISPER': this.onMessageDefaultChannel.bind(this),
			'STATE': this.onReceiveStateChannel.bind(this)
		};

		if (window.Service && !store.loading && !store.hasFinishedLoad) {
			this.onLogin();
		} else if (!window.Service) {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},


	onLogin: function() {
		var me = this,
			socket = me.ChatStore.getSocket();

		me.ChatStore.setLoaded();

		socket.register({
			'chat_setPresenceOfUsersTo': me.handleSetPresence.bind(me),
			'disconnect': me.createHandlerForChatEvents(me.onSocketDisconnect, 'disconnect'),
			'serverkill': me.createHandlerForChatEvents(me.onSocketDisconnect, 'serverkill'),
			'chat_exitedRoom': me.createHandlerForChatEvents(me.onExitedRoom, 'chat_exitedRoom'),
			'chat_roomMembershipChanged': me.createHandlerForChatEvents(me.onMembershipOrModerationChanged, 'chat_roomMembershipChanged'),
			'chat_recvMessage': me.createHandlerForChatEvents(me.onMessage, 'chat_recvMessage'),
			'chat_recvMessageForShadow': me.createHandlerForChatEvents(me.onMessage, 'chat_recvMessageForShadow')
		});

		socket.onSocketAvailable(me.onSessionReady, me);

		me.mon(me.LoginStore, 'will-logout', function(callback) {
			me.changePresence('unavailable', null, null, callback);
		});
	},


	onSessionReady: function() {
		console.log('Chat onSessionReady');

		var me = this;

		//TODO: Get all the active chats out of temp storage and restore them

		$AppConfig.Preferences.getPreference('ChatPresence/Active')
			.then(function(value) {
				if (value) {
					me.changePresence(value.get('type'), value.get('show'), value.get('status'));
				} else {
					me.changePresence('available');
				}
			});
	},


	handleSetPresence: function(msg) {
		var me = this, key,
			store = me.ChatStore, value;

		for (key in msg) {
			if (msg.hasOwnProperty(key)) {
				value = ParseUtils.parseItems([msg[key]])[0];
				store.setPresenceOf(key, value, this.changePresence.bind(this));
			}
		}
	},


	changePresence: function(type, show, status, c) {
		var socket = this.ChatStore.getSocket(),
			username = $AppConfig.username,
			newPresence = (type && type.isPresenceInfo) ? type : NextThought.model.PresenceInfo.createPresenceInfo(username, type, show, status),
			callback = c ? c : function() {};

		if (!newPresence.isOnline()) {
			this.ChatStore.setMySelfOffline();
		}

		socket.emit('chat_setPresence', newPresence.asJSON(), callback);
	},


	startChat: function(users, options) {
		var ri, m, me = this,
			socket = this.ChatStore.getSocket();

		options = options || {};
		if (!options.ContainerId) {
			options.ContainerId = Globals.CONTENT_ROOT;
		}

		if(!Ext.isArray(users)) {
			users = users && users.isModel ? users.get('Username') : users;
			users = [users];
		}

		users.push($AppConfig.userObject.get('Username'));
		users = Ext.unique(users);

		ri = this.ChatStore.getRoomInfo(users, options.ContainerId);
		if (ri) {
			this.ChatStore.showChatWindow(ri);
		}
		else {
			//If there were no existing rooms, create a new one.
			m = {'Occupants': users};
			socket.emit('chat_enterRoom', Ext.apply(m, options), Ext.bind(me.shouldShowRoom, me));
		}
	},


	shouldShowRoom: function(msg) {
		// This is mainly used as a callback to the socket to determine showing chat rooms that we created.
		var rInfo = msg && msg.isModel ? msg : ParseUtils.parseItems([msg])[0], w;
		if (rInfo) {
			this.ChatStore.showChatWindow(rInfo);
		} else {
			alert({title: 'Error', msg: 'Unable to start your chat at this time. Please try again later.', icon: 'warning-red'});
		}
	},


	createHandlerForChatEvents: function(fn, eventName) {
		var me = this;

		return function() {
			if (me.availableForChat) {
				fn.apply(me, arguments);
			}else if (me.debug) {
				console.log('Dropped ' + eventName + ' handling');
			}
		};
	},


	sendMessage: function(f, mid, channel, recipients) {
		var room = this.getRoomInfoFromComponent(f),
			val = f.getValue(),
			me = this;

		if (!room || Ext.isEmpty(val, false)) {
			console.error('Cannot send message, room', room, 'values', val);
			return;
		}
		this.clearErrorForRoom(room);
		this.postMessage(room, val, mid, channel, recipients, Ext.bind(me.sendAckHandler, me));

		f.focus();
	},


	postMessage: function(room, message, replyTo, channel, recipients, ack) {
		if (typeof message === 'string') {
			message = [message];
		}

		var m = {ContainerId: room.getId(), body: message, Class: 'MessageInfo'},
			messageRecord,
			socket = this.ChatStore.getSocket();

		if (channel) {
			m.channel = channel;
		}
		if (recipients) {
			m.recipients = recipients;
		}

		if (ack) {
			messageRecord = ParseUtils.parseItems([m]);
			messageRecord = messageRecord && messageRecord.length > 0 ? messageRecord[0] : null;
			ack = Ext.bind(ack, null, [messageRecord], true);
		}

		socket.emit('chat_postMessage', m, ack);
	},


	/**
	 * NOTE: We will ONLY manage our state in all the rooms we're currently involved in.
	 */
	publishChatStatus: function(room, newStatus, username) {
		var channel = 'STATE', oldStatus;
		username = username && Ext.isString(username) ? username : $AppConfig.username;
		oldStatus = room.getRoomState(username || $AppConfig.username);
		if (oldStatus !== newStatus) {
			console.log('transitioning room state for: ', $AppConfig.username, ' from ', oldStatus, ' to ', newStatus);
			this.postMessage(room, {'state': newStatus}, null, channel, null, Ext.emptyFn);
		}
	},


	onMessage: function(msg, opts) {
		var me = this, args = Array.prototype.slice.call(arguments),
				m = ParseUtils.parseItems([msg])[0],
				channel = m && m.get('channel'),
				cid = m && m.get('ContainerId'),
				w = this.ChatStore.getChatWindow(cid);

		if (!w) {
			this.ChatStore.rebuildWindow(cid)
				.then(me.onMessage.bind(me, msg, opts));
			return;
		}

		this.channelMap[channel].call(this, m, opts || {});

		if (channel !== 'STATE') {
			// NOTE: We don't want state channel notifications to trigger showing the window initially or adding
			// notification counts, only when an actual message is sent should we do this.
			this.ChatStore.notify(w, msg);
			/*if (!w.minimized && !w.isVisible() && w.hasBeenAccepted()) {
				w.show();
			}
			else {
				w.notify();
			}*/
		}
	},


	onMessageDefaultChannel: function(msg, opts) {
		var cid, win, sender, room, isGroupChat;

		cid = msg.get('ContainerId');
		win = this.ChatStore.getChatWindow(cid);
		// moderated = Boolean(opts && opts.hasOwnProperty('moderated'));
		sender = msg.get('Creator');
		room = win && win.roomInfo || this.ChatStore.getRoomInfoFromSession(cid);
		isGroupChat = room ? room.get('Occupants').length > 2 : false;

		if (win) {
			win.handleMessageFromChannel(sender, msg, room, isGroupChat);
		}
	},


	onReceiveStateChannel: function(msg) {
		var cid = msg.get('ContainerId'),
				body = msg.get('body'),
				sender = msg.get('Creator'),
				win = this.ChatStore.getChatWindow(cid),
				isGroupChat = win && win.roomInfo.get('Occupants').length > 2;

		if (win && body) {
			this.updateChatState(sender, body.state, win, isGroupChat);
		}
	},


	/**
	 *  We use this method to update the state of other chat participants.
	 *  Thus, it is responsible for updating the appropriate view,
	 *  but we don't keep track of other participants' state, because they manage it themselves.
	 */
	updateChatState: function(sender, state, win, isGroupChat, room) {
		if (!win || !sender || sender === '') {
			return;
		}

		room = room || win.roomInfo;
		if (room) {
			room.setRoomState(sender, state);
			console.log('Update chat state: set to ', state, ' for ', sender);
			win.updateChatState(sender, state, room, isGroupChat);
		}
	},


	startTrackingChatState: function(sender, room, w) {
		if (!w) {
			return;
		}
		this.updateChatState(sender, 'active', w, room.get('Occupants').length > 2);
		if (isMe(sender)) {
			w.down('chat-view').fireEvent('status-change', {state: 'active'}); //start active timer.
		}
	},


	/* CLIENT EVENTS */

	sendAckHandler: function(result, m) {
		function isError(result) {
			var errorCode = 'error-type';
			return result.hasOwnProperty(errorCode) && result[errorCode] === 'client-error';
		}

		if (isError(result)) {
			this.onMessageError(result, m);
		}
	},


	getRoomInfoFromComponent: function(c) {
		if (!c) {
			console.error('Cannot get RoomInfo from an undefined component.');
			return null;
		}

		if (c.roomInfo) {
			return c.roomInfo;
		}

		var o = c.up('[roomInfo]');

		if (!o) {
			console.error('The component', c, 'has no parent component with a roomInfo');
			return null;
		}

		return o.roomInfo;
	},


	clearErrorForRoom: function(room) {
		var cid, win, view;

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?
		cid = room.getId();
		win = this.ChatStore.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if (view) {
			view.clearError();
		}
		else {
			console.error('Unable to clear error for messages window', arguments);
		}
	},

	onSocketDisconnect: function() {
		this.ChatStore.removeSessionObject();
	},


	onExitedRoom: function(room) {
		this.ChatStore.removeSessionObject(room.ID);
	},


	onMembershipOrModerationChanged: function(msg) {
		var newRoomInfo = ParseUtils.parseItems([msg])[0],
			oldRoomInfo = newRoomInfo && this.ChatStore.getRoomInfoFromSession(newRoomInfo.getId()),
			occupants = newRoomInfo && newRoomInfo.get('Occupants'),
			toast;

		if (newRoomInfo && newRoomInfo.get('Moderators').length === 0 && newRoomInfo.get('Moderated')) {
			console.log('Transient moderation change encountered, ignoring', newRoomInfo);
			return null;
		}

		this.sendChangeMessages(oldRoomInfo, newRoomInfo);
		this.ChatStore.updateRoomInfo(newRoomInfo);

		//if membership falls to just me, and we have a toast, DESTROY!
		if (occupants.length === 1 && occupants[0] === $AppConfig.userObject.get('Username')) {
			toast = Ext.ComponentQuery.query('toast[roomId=' + IdCache.getIdentifier(newRoomInfo.getId()) + ']');
			if (toast && toast.length === 1) {
				toast[0].close();
			}

			if (oldRoomInfo) {
				this.ChatStore.removeSessionObject(oldRoomInfo.getId());
			}
		}

		return newRoomInfo; //for convinience chaining
	},


	sendChangeMessages: function(oldRoomInfo, newRoomInfo) {
		var oldOccupants = oldRoomInfo ? oldRoomInfo.get('Occupants') : [],
				newOccupants = newRoomInfo.get('Occupants'),
				oldMods = oldRoomInfo ? oldRoomInfo.get('Moderators') : [],
				newMods = newRoomInfo.get('Moderators'),
				left = Ext.Array.difference(oldOccupants, newOccupants),
				added = Ext.Array.difference(newOccupants, oldOccupants),
				leftMods = Ext.Array.difference(oldMods, newMods),
				addedMods = Ext.Array.difference(newMods, oldMods);

		this.onOccupantsChanged(newRoomInfo, left, added, leftMods, addedMods);
	},


	onOccupantsChanged: function(newRoomInfo, peopleWhoLeft, peopleWhoArrived) {
		var win = this.ChatStore.getChatWindow(newRoomInfo.getId()),
			log = win ? win.logView : null;

		if (!win) {
			return;
		}
		/*
		 if (this.isRoomEmpty(newRoomInfo)) {
		 tab.disableChat();
		 }
		 */
		Ext.each(peopleWhoLeft, function(p) {
			if (!isMe(p)) {
				UserRepository.getUser(p, function(u) {
					var name = u.getName();
					if (log) {
						log.addNotification(name + ' has left the chat...');
					}
				}, this);
			}
		});

		Ext.each(peopleWhoArrived, function(p) {
			if (!isMe(p)) {
				UserRepository.getUser(p, function(u) {
					var name = u.getName();
					if (log) {
						log.addNotification(name + ' entered the chat...');
					}
				}, this);
			}
		});
	},


	leaveRoom: function(room) {
		if (!room) { return; }

		var me = this,
			id = this.ChatStore.getTranscriptIdForRoomInfo(room),
			socket = this.ChatStore.getSocket();

		Service.getObject(id)
			.then(function(obj) {
				// TODO: Fix this.
				var cmp = Ext.getCmp('chat-history'),
					store = cmp && cmp.getStore();

				if (store) {
					store.add(obj);
				}
			})
			.fail(function() {
				console.warn('Failed to save chat history: ', arguments);
			});

		this.ChatStore.deleteRoomIdStatusAccepted(room.getId());

		if (this.isModerator(room)) {
			console.log('leaving room but I\'m a moderator, relinquish control');
			socket.emit('chat_makeModerated', room.getId(), false,
					function() {
						//unmoderate called, now exit
						console.log('unmoderated, now exiting room');
						socket.emit('chat_exitRoom', room.getId());
					}
			);
		}
		else {
			//im not a moderator, just leave
			socket.emit('chat_exitRoom', room.getId());
		}
	},


	isModerator: function(ri) {
		return Ext.Array.contains(ri.get('Moderators'), $AppConfig.username);
	},

	zoomWhiteboard: function(cmp, data) {
		Ext.widget('wb-window', { width: 802, value: data, readonly: true}).show();
	},


	replyToWhiteboard: function(wbData, cmp, midReplyOf, channel, recipients) {
		this.ChatStore.fireEvent('show-whiteboard', wbData, cmp, midReplyOf, channel, recipients);
	},


	sendWhiteboard: function(chatEntryWidget, mid, channel, recipients) {
		this.ChatStore.fireEvent('show-whiteboard', null, chatEntryWidget, mid, channel, recipients);
	}
});
