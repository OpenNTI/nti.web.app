Ext.define('NextThought.controller.Chat', {
	extend: 'Ext.app.Controller',
	requires: [
		'NextThought.cache.AbstractStorage',
		'NextThought.cache.IdCache',
		'NextThought.util.Annotations',
		'NextThought.util.Parsing',
		'NextThought.proxy.Socket',
		'NextThought.view.toast.Manager'
	],

	debug: true,
	availableForChat: false,


	stores: [
		'PresenceInfo'
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


	init: function() {
		var me = this,
			store = me.getPresenceInfoStore();

		this.setChannelMap();

		//set up a listener in UserRepository for the presence-changed event

		UserRepository.setPresenceChangeListener(store);


		//A reference to the socket to use for live messages
		this.socket = this.socket || Socket;

		this.socket.register({
			'disconnect': me.createHandlerForChatEvents(me.onSocketDisconnect, 'disconnect'),
			'serverkill': me.createHandlerForChatEvents(me.onSocketDisconnect, 'serverkill'),
			'chat_enteredRoom': me.createHandlerForChatEvents(me.onEnteredRoom, 'chat_enteredRoom'),
			'chat_exitedRoom': me.createHandlerForChatEvents(me.onExitedRoom, 'chat_exitedRoom'),
			'chat_roomMembershipChanged': me.createHandlerForChatEvents(me.onMembershipOrModerationChanged, 'chat_roomMembershipChanged'),
			//			'chat_roomModerationChanged' : me.createHandlerForChatEvents(me.onModerationChange, 'chat_roomMOderationChanged'),
			/*'chat_presenceOfUserChangedTo': function (user, presesence){
				UserRepository.presenceChanged(user, presence);
			},*/
			'chat_setPresenceOfUsersTo': function() {
				me.handleSetPresence.apply(me, arguments);
			},
			'chat_recvMessage': me.createHandlerForChatEvents(me.onMessage, 'chat_recvMessage'),
			//			'chat_recvMessageForAttention' : me.createHandlerForChatEvents(me.onMessageForAttention, 'chat_recvMessageForAttention'),
			//			'chat_recvMessageForModeration' : me.createHandlerForChatEvents(me.onModeratedMessage, 'chat_recvMessageForModeration'),
			'chat_recvMessageForShadow': me.createHandlerForChatEvents(me.onMessage, 'chat_recvMessageForShadow')
			//			'chat_failedToEnterRoom' : me.createHandlerForChatEvents(me.onFailedToEnterRoom, 'chat_failedToEnterRoom')
		});

		this.listen({
			component: {

				//			    'chat-log-view':{'approve': function(ids){this.approveMessages(ids);}},
				//			    'chat-log-view button[action]':{'click': this.toolClicked},
				//			    'chat-log-view tool[action]':{'click': this.toolClicked},

				'*': {
					'set-chat-status': 'changeStatus',
					'set-chat-show': 'changeShow',
					'set-chat-type': 'changeType',
					'set-chat-presence': 'changePresence',
					'group-chat': 'enterRoom',
					'chat': 'enterRoom',
					'adhock-chat': 'flattenOccupantsAndEnterRoom'
				},

				'chat-view chat-entry': {
					'send': 'send',
					'send-whiteboard': 'sendWhiteboard'
				},

				'chat-view chat-log-entry': {
					'reply-to-whiteboard': 'replyToWhiteboard'
				},

				'chat-view': {
					'flag-messages': 'flagMessages',
					'publish-chat-status': 'publishChatStatus'
				},
				'chat-log-entry': {
					'link-clicked': 'linkClicked',
					'show-whiteboard': 'zoomWhiteboard'
				},
				'chat-transcript-window': {
					'flag-messages': 'flagTranscriptMessages'
				},

				'chat-transcript': {
					'link-clicked': 'linkClicked',
					'show-whiteboard': 'zoomWhiteboard'
				},

				'chat-window': {
					'beforedestroy': function(cmp) {
						if (!cmp.disableExitRoom) {
							this.leaveRoom(this.getRoomInfoFromComponent(cmp));
						}
					},

					'add-people': function(cmp, people) {
						var ri = this.getRoomInfoFromComponent(cmp),
							o = ri.data.Occupants;

						if (!Ext.isArray(people)) {
							people = [people];
						}
						o.push.apply(o, people);
						me.socket.emit('chat_enterRoom', {NTIID: ri.getId(), Occupants: o});
					}
				},

				'script-entry': {
					'script-to-chat': 'send'
				}
			},

			controller: {
				'*': {
					'set-chat-status': 'changeStatus',
					'set-chat-show': 'changeShow',
					'set-chat-type': 'changeType'
				}
			}
		});

		//handle some events on session, open existing chat rooms and clear the session on logout.


		this.application.on('session-ready', function() {
			Socket.onSocketAvailable(this.onSessionReady, this);
		}, this);
		this.application.on('session-closed', this.removeSessionObject, this);
		this.application.on('will-logout', function(callback) {
			this.changePresence('unavailable', null, null, callback);
		},this);
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


	setChannelMap: function() {
		//table of behaviour based on channel
		this.channelMap = {
			//			'CONTENT': this.onMessageContentChannel,
			//			'POLL': this.onMessagePollChannel,
			//			'META': this.onMessageMetaChannel,
			'DEFAULT': this.onMessageDefaultChannel,
			'WHISPER': this.onMessageDefaultChannel,
			'STATE': this.onReceiveStateChannel
		};
	},


	onSessionReady: function() {
		//open any rooms we were currently involved in
		console.log('Chat onSessionReady');//card 1768
		var me = this,
				roomInfos = me.getAllRoomInfosFromSession(),
				w, presenceState, active;
		Ext.each(roomInfos, function(ri) {
			me.onEnteredRoom(ri);
			w = me.getChatWindow(ri);

			//This chunk will try to recover the history and insert it into the chat again...
			ViewUtils.getTranscript(ri.getId(),
					ri.get('Last Modified'),
					function(transcript) {
						var messages = transcript.get('Messages');
						messages = Ext.Array.sort(messages, function(a, b) {
							var aRaw = a.raw || {CreatedTime: 0},
									bRaw = b.raw || {CreatedTime: 0};

							return aRaw.CreatedTime - bRaw.CreatedTime;
						});

						Ext.each(messages, function(m) {
							me.onMessage(m);
						}, me);
						if (me.isRoomIdAccepted(ri.getId())) {
							w.show();
							w.minimize();
						}
					},
					function() {
						console.error('Could not recover chat history.');
						me.onExitedRoom(ri.getData());
					}, this);

		});

		//restore the active presence form the preferences or chhange presence to available
		$AppConfig.Preferences.getPreference('ChatPresence/Active', function(value) {
			if (value) {
				me.changePresence(value.get('type'), value.get('show'), value.get('status'));
			}else {
				me.changePresence('available');
			}
		});

		Socket.on('socket-new-sessionid', function() {
			console.log('New Socket Id, rebroadcasting presence');
			this.changePresence(this.getPresenceInfoStore().getPresenceOf($AppConfig.username));
		}, this);

	},


	/* UTILITY METHODS */

	isPersistantRoomId: function(id) {
		return (/meetingroom/i).test(id);
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


	getChatWindow: function(r) {
		if (!r) {
			return null;
		}

		var rIsString = (typeof r === 'string'),
				id = IdCache.getIdentifier(rIsString ? r : r.getId()),
				w = Ext.ComponentQuery.query('chat-window[roomInfoHash=' + id + ']')[0],
				allRooms = Ext.ComponentQuery.query('chat-window'),
				xOcc;

		if (!w) {
			//see if we have rooms with the same occupants list:
			Ext.each(allRooms, function(x) {
				xOcc = x.roomInfo.getOriginalOccupants();
				//only do the next step for 1 to 1 chats, group chat changes like this could really mess everyone else up.
				if (xOcc.length > 2) {
					return;
				}
				if (rIsString) {
					return;
				} //Be defensive.
				if (Ext.Array.union(xOcc, r.get('Occupants')).length === xOcc.length) {
					console.log('found a different room with same occupants: ', xOcc);
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
	 * @param {Array} users list of users
	 * @param {String} roomId roomid
	 * @param {Object} options
	 * @return {NextThought.model.RoomInfo}
	 */
	existingRoom: function(users, roomId, options) {
		//Add ourselves to this list
		var key, rInfo,
				allUsers = Ext.Array.unique(users.slice().concat($AppConfig.username)),
				chats = this.getSessionObject();

		if (options && options.ContainerId && !roomId) {
			roomId = options.ContainerId;
		}

		for (key in chats) {
			if (chats.hasOwnProperty(key)) {
				rInfo = this.getRoomInfoFromSession(key, chats[key]);
				if (rInfo) {
					if (roomId && roomId === rInfo.getId()) {
						break;//leave rInfo as is, so we can return it;
					}
					else if (!this.isPersistantRoomId(rInfo.getId())) {

						if (Ext.Array.difference(rInfo.get('Occupants'), allUsers).length === 0 &&
							Ext.Array.difference(allUsers, rInfo.get('Occupants')).length === 0) {
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

		if (typeof message === 'string') {
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

		if (ack) {
			messageRecord = ParseUtils.parseItems([m]);
			messageRecord = messageRecord && messageRecord.length > 0 ? messageRecord[0] : null;
			ack = Ext.bind(ack, null, [messageRecord], true);
		}

		this.socket.emit('chat_postMessage', m, ack);
	},


	approveMessages: function(messageIds) {
		this.socket.emit('chat_approveMessages', messageIds);
	},


	flattenOccupantsAndEnterRoom: function(occupants, options) {
		if (!$AppConfig.service.canChat()) {
			console.log('User not permissioned to chat.');
			return undefined;
		}

		var flStore = Ext.getStore('FriendsList'),
				pStore = Ext.getStore('PresenceInfo'),
				flattened = [],
				push = Array.prototype.push;

		function online(v) {
			return !isMe(v) && pStore.findExact('username', v) > -1;
		}

		Ext.each(occupants, function(o) {
			var list = flStore.findExact('Username', o);
			if (list < 0) {
				push.call(flattened, o);
				return;
			}

			list = flStore.getAt(list);
			push.apply(flattened, list.getFriends());
		});

		flattened = Ext.Array.filter(Ext.Array.unique(flattened), online);

		return this.enterRoom(flattened, options);
	},



	/*
	 * Creates a room to enter from the given user, list of user, or friends list / dfl.
	 * If a friendslist or dfl is provided, the option persistent will define if that list is
	 * expanding to a list of friends, or used to start a persistent room.  If persistent is missing
	 * the default behaviour is to start a persistent list (this seems backwards but it is the old
	 * behaviour.
	 */
	enterRoom: function(usersOrList, options) {
		if (!this.availableForChat) { return; }
		if (!$AppConfig.service.canChat()) {
			console.log('User not permissioned to chat.');
			return;
		}

		options = options || {};
		var users = [], k, ri, roomCfg,
				openPersistently = options.persistent !== undefined ? options.persistent : true,
				isListOrDFL = usersOrList.get && usersOrList.get('friends'), w, me = this;

		//Don't send the persistent option to the ds
		delete options.persistent;

		//chat rooms need a containerId, make sure we add these, let them get overridden later if it's a persistant room
		options.ContainerId = options.ContainerId || Globals.CONTENT_ROOT;
		if (!options.ContainerId) {
			delete options.ContainerId;
		}

		//We do persistence if it was requested and we were given something that can
		//be opened persistently
		if (isListOrDFL && openPersistently) {
			//OK it is something that can be opened persistently, and we want it
			//persistent.  Update the ContainerId to reflect it.  In this case we don't
			//specify users(Why ?).
			options.ContainerId = usersOrList.get('NTIID');
			users = usersOrList.get('friends');
			console.log('Will start a persistent room for container', options.ContainerId);
		}
		else {
			//Not persistent, if it is a group or dfl pull out the users, it could also
			//already be a list of users, or a user
			if (isListOrDFL) {
				users = usersOrList.get('friends');
			}
			else if (!Ext.isArray(usersOrList)) {
				users = [usersOrList];
			}
			else {
				users = usersOrList;
			}
		}

		users = Ext.Array.clone(users);

		for (k in users) {
			if (users.hasOwnProperty(k)) {
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
			w = this.getChatWindow(ri);
			if (w) {
				w.notify();
				w.show();
				setTimeout(function() {
					w.down('chat-entry').focus();
				}, 500);
			}
		}
		else { //If we get here, there were no existing rooms, so create a new one.
			roomCfg = {'Occupants': users};

			//no occupants required if there's a container id and it's a class/study room etc.
			if (options.ContainerId && this.isPersistantRoomId(options.ContainerId)) {
				roomCfg.Occupants = [];
			}
			this.socket.emit('chat_enterRoom', Ext.apply(roomCfg, options), Ext.bind(me.shouldShowRoom, me));
		}
	},

	shouldShowRoom: function(msg) {
		// This is mainly used as a callback to the socket to determine showing chat rooms that we created.
		var rInfo = msg && msg.isModel ? msg : ParseUtils.parseItems([msg])[0], w;
		if (rInfo) {
			w = this.getChatWindow(rInfo);
			if (w) {
				w.show();
				setTimeout(function() {
					w.down('chat-entry').focus();
				}, 500);
			}
		} else {
			alert({title: 'Error', msg: 'Unable to start your chat at this time. Please try again later.', icon: 'warning-red'});
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

	sendAckHandler: function(result, m) {
		function isError(result) {
			var errorCode = 'error-type';
			return result.hasOwnProperty(errorCode) && result[errorCode] === 'client-error';
		}

		if (isError(result)) {
			this.onMessageError(result, m);
		}
	},


	clearErrorForRoom: function(room) {
		var cid, win, view;

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?

		cid = room.getId();
		win = this.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if (view) {
			view.clearError();
		}
		else {
			console.error('Unable to clear error for messages window', arguments);
		}
	},


	send: function(f, mid, channel, recipients) {
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


	getHashChange: function(href, base) {
		var hash = href.split('#'),
				newLocation = hash[0],
				target = hash[1];

		if (newLocation.indexOf(base) === 0 && href !== window.location.href && target.indexOf('!') === 0) {
			return target;
		}

		return null;
	},


	linkClicked: function(cmp, href) {
		var target,
				whref = window.location.href.split('#')[0];

		function openHref(link, t) {
			try {
				window.open(link, t);
			}
			catch (er) {
				window.location.href = link;
			}
		}

		if (href.href) {
			href = href.href;
		}

		//if there is no href, or the href if the current location return
		if (!href || whref + '#' === href || href === window.location.href) {
			return false;
		}

		target = this.getHashChange(href, whref);

		if (target) {
			this.fireEvent('change-hash', target);
			return false;
		}

		openHref(href, '_blank');
		return false;
	},


	zoomWhiteboard: function(cmp, id) {
		Ext.widget('wb-window', { width: 802, value: id, readonly: true}).show();
	},


	replyToWhiteboard: function(wbData, cmp, midReplyOf, channel, recipients) {
		this.showWhiteboard(wbData, cmp, midReplyOf, channel, recipients);
	},


	sendWhiteboard: function(chatEntryWidget, mid, channel, recipients) {
		this.showWhiteboard(null, chatEntryWidget, mid, channel, recipients);
	},


	showWhiteboard: function(data, cmp, mid, channel, recipients) {
		var me = this,
			room = this.getRoomInfoFromComponent(cmp),
			wbWin = Ext.widget('wb-window', {width: 802, value: data, chatStatusEvent: 'status-change', ownerCmp: cmp}),
			wbData,
			scrollEl = cmp.up('.chat-view').el.down('.chat-log-view'),
			scrollTop = scrollEl.getScroll().top;

		//hook into the window's save and cancel operations:
		wbWin.on({
			save: function(win, wb) {
				wbData = wb.getValue();
				me.clearErrorForRoom(room);
				me.postMessage(room, [wbData], mid, channel, recipients, Ext.bind(me.sendAckHandler, me));
				wbWin.close();
			},
			cancel: function() {
				//if we haven't added the wb to the editor, then clean up, otherwise let the window handle it.
				wbWin.close();
				if (scrollEl.getScroll().top === 0) {
					scrollEl.scrollTo('top', scrollTop);
				}
			}
		});

		//show window:
		wbWin.show();
	},


	flagMessages: function(messages, chatView) {
		var m;
		Ext.each(messages, function(e) {
			m = e.message;
			m.postTo('flag', function() {
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
	publishChatStatus: function(room, newStatus, username) {
		var channel = 'STATE', oldStatus;
		username = username && Ext.isString(username) ? username : $AppConfig.username;
		oldStatus = room.getRoomState(username || $AppConfig.username);
		if (oldStatus !== newStatus) {
			console.log('transitioning room state for: ', $AppConfig.username, ' from ', oldStatus, ' to ', newStatus);
			this.postMessage(room, {'state': newStatus}, null, channel, null, Ext.emptyFn);
		}
	},


	flagTranscriptMessages: function(messages, chatView) {
		var m, s;
		Ext.each(messages, function(e) {
			m = e.message;
			s = Ext.fly(e.sender);
			m.postTo('flag', function() {
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


	updateRoomInfo: function(ri) {
		var win = this.getChatWindow(ri.getId()),
				ro = win ? win.roomInfo : this.getRoomInfoFromSession(ri.getId());
		if (ro) {
			ro.fireEvent('changed', ri);
		}
		this.putRoomInfoIntoSession(ri);
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


	openChatWindow: function(roomInfo) {
		var w = this.getChatWindow(roomInfo);
		if (!w) {
			w = Ext.widget(
					'chat-window', {
						roomInfo: roomInfo
					});
		}
		return w;
	},


	rebuildWindow: function(roomInfoId, callback) {
		var service = $AppConfig.service;

		function success(obj) {
			this.openChatWindow(obj);
			Ext.callback(callback);
		}

		service.getObject(roomInfoId,
				success,
				function() {
					alert('Could not recover room info');
					console.error('Could not resolve roomInfo for: ', roomInfoId);
				},
				this);
	},


	leaveRoom: function(room) {
		if (!room) {
			return;
		}

		var me = this,
			id = ViewUtils.convertToTranscriptId(room.getId(), room.get('Creator'));

		function success(obj) {
			var cmp = Ext.getCmp('chat-history'),
					store = cmp && cmp.getStore();

			if (store) {
				store.add(obj);
			}

		}

		function failure() {
			console.log('Failure');
		}

		$AppConfig.service.getObject(id, success, failure, this);

		this.deleteRoomIdStatusAccepted(room.getId());

		if (this.isModerator(room)) {
			console.log('leaving room but I\'m a moderator, relinquish control');
			this.socket.emit('chat_makeModerated', room.getId(), false,
					function() {
						//unmoderate called, now exit
						console.log('unmoderated, now exiting room');
						me.socket.emit('chat_exitRoom', room.getId());
					}
			);
		}
		else {
			//im not a moderator, just leave
			this.socket.emit('chat_exitRoom', room.getId());
		}
	},


	/* SERVER EVENT HANDLERS*/


	onSocketDisconnect: function() {
		this.removeSessionObject();
	},


	handleSetPresence: function(msg) {
		var me = this,
				store = this.getPresenceInfoStore();

		Ext.Object.each(msg, function(key, value) {
			var presence = ParseUtils.parseItems([value])[0],
					prevToast = Ext.getCmp('revertToast');

			//if its the current user set the flag accordingly
			if (isMe(key)) {
				if (presence.isOnline()) {
					me.availableForChat = true;
					if (prevToast) {
						prevToast.destroy();
					}

				}else {
					if (!me.setMyselfOffline && store.getPresenceOf(key).isOnline()) {
						console.log('Set offline in another session');
						me.setMyselfOffline = false;

						if (prevToast) {
							prevToast.destroy();
						}
						Toaster.makeToast({
							id: 'revertToast',
							message: 'You are currently unvailable because you went offline in another session.',
							buttons: [
								{
									label: 'Okay'
								},
								{
									label: 'Set to available',
									callback: function() {
										presence.set({type: 'available', show: 'chat'});
										me.changePresence(presence);
									},
									scope: me
								}
							]
						});
					}

					me.availableForChat = false;
				}
			}

			store.setPresenceOf(key, presence);
		});
	},


	/*
	* Tells the server to change the presence of the current user
	*
	* @param type - the users availability 'available' or 'unavailable' or a PresenceInfo model
	* @param [show] - show the user as 'chat','away','dnd', or'xa'
	* @param [status] - message to show if the user is available
	* @param [c] - function to call when the socket is done
	*/
	changePresence: function(type, show, status, c) {
		var me = this,
			username = $AppConfig.username,
			newPresence = (type && type.isPresenceInfo) ? type : NextThought.model.PresenceInfo.createPresenceInfo(username, type, show, status),
			callback = (Ext.isFunction(c)) ? c : Ext.emptyFn;


		if (!newPresence.isOnline()) {
			me.setMyselfOffline = true;
			Ext.defer(function() {
				me.setMyselfOffline = false;
			}, 5 * 1000);
		}

		this.socket.emit('chat_setPresence', newPresence.asJSON(), callback);
	},


	changeType: function(type) {
		var presence = $AppConfig.userObject.get('Presence'),
				show = presence.get('show'),
				status = presence.get('status');

		this.availableForChat = (type !== 'unavailable');
		this.changePresence(type, show, status);
	},


	changeShow: function(show) {
		var status = $AppConfig.userObject.get('Presence').get('status');
		//if the user changes show, also set them to available
		this.changePresence('available', show, status);
	},


	changeStatus: function(status) {
		var presence = $AppConfig.userObject.get('Presence'),
				show = presence.get('show'),
				type = presence.get('type');
		this.changePresence(type, show, status);
	},


	onMembershipOrModerationChanged: function(msg) {
		var newRoomInfo = ParseUtils.parseItems([msg])[0],
				oldRoomInfo = this.getRoomInfoFromSession(newRoomInfo.getId()),
				occupants = newRoomInfo.get('Occupants'),
				toast;

		if (newRoomInfo.get('Moderators').length === 0 && newRoomInfo.get('Moderated')) {
			console.log('Transient moderation change encountered, ignoring', newRoomInfo);
			return null;
		}

		this.sendChangeMessages(oldRoomInfo, newRoomInfo);
		this.updateRoomInfo(newRoomInfo);

		//if membership falls to just me, and we have a toast, DESTROY!
		if (occupants.length === 1 && occupants[0] === $AppConfig.userObject.get('Username')) {
			toast = Ext.ComponentQuery.query('toast[roomId=' + IdCache.getIdentifier(newRoomInfo.getId()) + ']');
			if (toast && toast.length === 1) {
				toast[0].close();
			}
			this.removeSessionObject(oldRoomInfo.getId());
		}


		return newRoomInfo; //for convinience chaining
	},


	onExitedRoom: function(room) {
		this.removeSessionObject(room.ID);
	},


	onMessageError: function(errorObject, msg) {
		var cid, win, view;

		if (!msg) {
			//TODO what to do here, pop up something generic.
			console.error('No message object tied to error.  Dropping error', errorObject);
			return;
		}

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?

		cid = msg.get('ContainerId');
		win = this.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if (view) {
			view.showError(errorObject);
		}
		else {
			console.warn('Error sending chat message but no chat view to show it in', msg, errorObject);
		}
	},


	onMessage: function(msg, opts) {
		var me = this, args = Array.prototype.slice.call(arguments),
				m = ParseUtils.parseItems([msg])[0],
				channel = m.get('channel'),
				cid = m.get('ContainerId'),
				w = this.getChatWindow(cid);

		if (!w) {
			this.rebuildWindow(cid, function() {
				me.onMessage.apply(me, args);
			});
			return;
		}

		this.channelMap[channel].call(this, m, opts || {});

		if (channel !== 'STATE') {
			// NOTE: We don't want state channel notifications to trigger showing the window initially or adding
			// notification counts, only when an actual message is sent should we do this.
			w.notify(msg);
			/*if (!w.minimized && !w.isVisible() && w.hasBeenAccepted()) {
				w.show();
			}
			else {
				w.notify();
			}*/
		}
	},


	onOccupantsChanged: function(newRoomInfo, peopleWhoLeft, peopleWhoArrived/*, modsLeft, modsAdded*/) {
		var win = this.getChatWindow(newRoomInfo.getId()),
				log = win ? win.down('chat-log-view[moderated=false]') : null;

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


	onMessageDefaultChannel: function(msg, opts) {
		var cid, win, moderated, log, sender, room, isGroupChat;

		cid = msg.get('ContainerId');
		win = this.getChatWindow(cid);
		moderated = Boolean(opts && opts.hasOwnProperty('moderated'));
		sender = msg.get('Creator');
		room = this.getRoomInfoFromSession(cid);
		isGroupChat = room ? room.get('Occupants').length > 2 : false;

		log = win.down('chat-log-view[moderated=true]');
		win.down('chat-log-view[moderated=' + moderated + ']').addMessage(msg);
		this.updateChatState(sender, 'active', win, isGroupChat);
		if (!moderated && log) {
			log.removeMessage(msg);
		}
	},


	onReceiveStateChannel: function(msg) {
		var cid = msg.get('ContainerId'),
				body = msg.get('body'),
				sender = msg.get('Creator'),
				win = this.getChatWindow(cid),
				isGroupChat = win.roomInfo.get('Occupants').length > 2;

		if (win && body) {
			this.updateChatState(sender, body.state, win, isGroupChat);
		}
	},


	/**
	 *  We use this method to update the state of other chat participants.
	 *  Thus, it is responsible for updating the appropriate view,
	 *  but we don't keep track of other participants' state, because they manage it themselves.
	 */
	updateChatState: function(sender, state, win, isGroupChat) {
		if (!win || !sender || sender === '') {
			return;
		}
		var room = win.roomInfo,
				log = win.down('chat-log-view'), gutter = win.down('chat-gutter'), inputStates,
				wasPreviouslyInactive = room.getRoomState(sender) === 'inactive' || !room.getRoomState(sender);

		room.setRoomState(sender, state);
		console.log('Update chat state: set to ', state, ' for ', sender);

		if (log) {
			log.clearChatStatusNotifications();
		}
		inputStates = room.getInputTypeStates();
		if (inputStates.length > 0) {
			if (log) {
				log.showInputStateNotifications(inputStates);
			}
			// NOTE: if the user is typing that means he is active.
			if (!wasPreviouslyInactive) {
				return;
			}

			state = 'active';
		}

		win.updateDisplayState(sender, state, isGroupChat);
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


	onEnteredRoom: function(msg) {
		function isAcceptedOrTimedOut() {
			me.setRoomIdStatusAccepted(roomInfo.getId());
			w.accept(true);
			me.startTrackingChatState(roomInfo.get('Creator'), roomInfo, w);
			if (isGroupChat) {
				w.show();
			}
		}

		//because we are using this callback for both the button and window close callback.  There are 2 signatures,
		//we ignore one so we dont try to exit a room twice.
		function isDeclined(btnOrFalse) {
			if ((btnOrFalse === false || btnOrFalse.label === 'decline') && w && !w.isDestroyed) {
				me.leaveRoom(roomInfo);
				w.close();
			}
		}

		var me = this,
				roomInfo = msg && msg.isModel ? msg : ParseUtils.parseItems([msg])[0],
				w,
				occupants = roomInfo.get('Occupants'),
				isGroupChat = (occupants.length > 2);

		roomInfo.setOriginalOccupants(occupants.slice());
		me.putRoomInfoIntoSession(roomInfo);
		w = me.openChatWindow(roomInfo);

		//Rules for auto-accepting are getting complicated, I will enumerate them here:
		//1) if it's not a group chat, accept
		//2) regardless of group or not, if the room has been previously accepted, accept (like a refresh)
		//3) if you created it, accept
		if (!isGroupChat || me.isRoomIdAccepted(roomInfo.getId()) || isMe(roomInfo.get('Creator'))) {
			isAcceptedOrTimedOut();
			return;
		}

		UserRepository.getUser(roomInfo.get('Creator'), function(u) {
			//at this point, window has been created but not accepted.
			Toaster.makeToast({
				roomId: IdCache.getIdentifier(roomInfo.getId()),
				title: isGroupChat ? 'Group Chat...' : 'Chat Invitation...',
				message: isGroupChat ?
						 'You\'ve been invited to chat with <span>' + (occupants.length - 1) + '</span> friends.' :
						 '<span>' + u.getName() + '</span> would like to chat.',
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


	putRoomInfoIntoSession: function(roomInfo) {
		if (!roomInfo) {
			Ext.Error.raise('Requires a RoomInfo object');
		}
		var roomData = roomInfo.getData();
		roomData.originalOccupants = roomInfo.getOriginalOccupants();
		//		console.log('****** setting original occupants of room', roomInfo.getId(), ' to: ', roomInfo.getOriginalOccupants());

		this.setSessionObject(roomData, roomInfo.getId());
	},


	getRoomInfoFromSession: function(key, json) {
		if (!key) {
			Ext.Error.raise('Requires key to look up RoomInfo');
		}

		var m;
		json = json || this.getSessionObject(key);

		if (json) {
			try {
				m = new NextThought.model.RoomInfo(json);
				m.setOriginalOccupants(json.originalOccupants);
				return m;
			}
			catch (e) {
				console.warn('Item in session storage is not a roomInfo', json);
			}
		}
		return null; //not there
	},


	getAllRoomInfosFromSession: function() {
		var roomInfos = [], ri, key, chats;

		chats = this.getSessionObject();

		for (key in chats) {
			if (chats.hasOwnProperty(key)) {
				if (key && key !== 'roomIdsAccepted') {
					ri = this.getRoomInfoFromSession(key, chats[key]);
					if (ri) {
						roomInfos.push(ri);
					}
				}
			}
		}
		return roomInfos;
	},


	setRoomIdStatusAccepted: function(id) {
		var key = 'roomIdsAccepted',
				status = this.getSessionObject(key) || {};

		status[id] = true;

		this.setSessionObject(status, key);
	},


	deleteRoomIdStatusAccepted: function(id) {
		var key = 'roomIdsAccepted',
				status = this.getSessionObject(key);
		if (!status) {
			return;
		}

		delete status[id];

		this.setSessionObject(status, key);
	},


	isRoomIdAccepted: function(id) {
		return Boolean((this.getSessionObject('roomIdsAccepted') || {})[id]);
	},


	/**
	 *
	 * @param {String} [key] Optional sub-key
	 * @return {*}
	 */
	getSessionObject: function(key) {
		var o = TemporaryStorage.get('chats') || {};
		if (!Ext.isEmpty(key)) {
			return o[key];
		}
		return o;
	},


	/**
	 *
	 * @param {Object} o Value to put into session storage.
	 * @param {String} [key] Optional key. If present, `o` is assumed to be the new value at the `key` instead of
	 *              the whole session object.
	 */
	setSessionObject: function(o, key) {
		var leaf = o;
		if (!Ext.isEmpty(key)) {
			o = this.getSessionObject();
			o[key] = leaf;
		}

		TemporaryStorage.set('chats', o);
	},


	/**
	 *
	 * @param {String} [key]
	 */
	removeSessionObject: function(key) {
		if (!Ext.isEmpty(key)) {
			var o = this.getSessionObject();
			delete o[key];
			this.setSessionObject(o);
			return;
		}
		TemporaryStorage.remove('chats');
	}

});
