const Ext = require('@nti/extjs');
const { default: Logger } = require('@nti/util-logger');
const IdCache = require('internal/legacy/cache/IdCache');
const UserRepository = require('internal/legacy/cache/UserRepository');
const Toaster = require('internal/legacy/common/toast/Manager');
const Globals = require('internal/legacy/util/Globals');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const { getService } = require('@nti/web-client');
const { Array: ArrayUtils } = require('@nti/lib-commons');
const LoginStateStore = require('internal/legacy/login/StateStore');

const ChatStateStore = require('./StateStore');

require('internal/legacy/common/Actions');
require('internal/legacy/model/MessageInfo');

const { isMe } = Globals;
const logger = Logger.get('nextthought:extjs:app:chat:Actions');

module.exports = exports = Ext.define('NextThought.app.chat.Actions', {
	extend: 'NextThought.common.Actions',

	statics: {
		create() {
			return this.instance || (this.instance = new exports());
		},
	},

	constructor: function () {
		this.callParent(arguments);

		this.ChatStore = ChatStateStore.getInstance();
		this.LoginStore = LoginStateStore.getInstance();

		var store = this.ChatStore;

		this.channelMap = {
			DEFAULT: this.onMessageDefaultChannel.bind(this),
			WHISPER: this.onMessageDefaultChannel.bind(this),
			STATE: this.onReceiveStateChannel.bind(this),
		};

		if (window.Service && !store.loading && !store.hasFinishedLoad) {
			this.onLogin();
		} else if (!window.Service) {
			this.mon(this.LoginStore, 'login-ready', this.onLogin.bind(this));
		}
	},

	async onLogin() {
		const service = await getService();
		const chat = (this.client = service.getChatClient());

		this.ChatStore.setLoaded();

		chat.on('disconnect', this.onSocketDisconnect.bind(this));
		chat.on(
			'room-membership-changed',
			this.onMembershipOrModerationChanged.bind(this)
		);
		chat.on('message', this.onMessage.bind(this));
		chat.on('entered-room', this.onEnteredRoom.bind(this));
		chat.on('exited-room', this.onExitedRoom.bind(this));

		this.mon(this.LoginStore, 'will-logout', callback => {
			chat.changePresence(undefined, callback);
		});
	},

	createChatRoom(users, options) {
		return new Promise(fulfill => {
			this.ChatStore.on({
				single: true,
				'show-window': fulfill,
			});

			this.startChat(users, options);
		});
	},

	startChat: function (users, options) {
		var ri,
			me = this;

		options = options || {};
		if (!options.ContainerId) {
			options.ContainerId = Globals.CONTENT_ROOT;
		}

		if (!Ext.isArray(users)) {
			users = users && users.isModel ? users.get('Username') : users;
			users = [users];
		}

		users.push($AppConfig.userObject.get('Username'));
		users = Ext.unique(users);

		ri = this.ChatStore.existingRoom(users, options.ContainerId, options);
		if (ri) {
			if ((options || {}).silent === true) {
				this.onEnteredRoom(ri);
			} else {
				this.ChatStore.showChatWindow(ri);
			}
		} else {
			//If there were no existing rooms, create a new one.
			let occupants = users;

			//no occupants required if there's a container id and it's a class/study room etc.
			if (
				options.ContainerId &&
				this.ChatStore.isPersistentRoomId(options.ContainerId)
			) {
				occupants = [];
			}

			this.client.enterRoom(
				occupants,
				options,
				me.shouldShowRoom.bind(me, options)
			);
		}
	},

	shouldShowRoom: function (options, msg) {
		// This is mainly used as a callback to the socket to determine showing chat rooms that we created.
		var rInfo =
			msg && msg.isModel ? msg : lazy.ParseUtils.parseItems([msg])[0];
		if (rInfo) {
			if ((options || {}).silent === true) {
				this.onEnteredRoom(rInfo);
			} else {
				this.ChatStore.showChatWindow(rInfo);
			}
		} else {
			alert({
				title: 'Error',
				msg: 'Unable to start your chat at this time. Please try again later.',
				icon: 'warning-red',
			});
		}
	},

	onEnteredRoom: function (msg) {
		var me = this,
			w,
			roomInfo =
				msg && msg.isModel
					? msg
					: lazy.ParseUtils.parseItems([msg.__toRaw?.() || msg])[0],
			occupants = roomInfo.get('Occupants'),
			isGroupChat = occupants.length > 2;

		roomInfo =
			roomInfo && roomInfo.isModel
				? roomInfo
				: lazy.ParseUtils.parseItems([roomInfo])[0];
		roomInfo.setOriginalOccupants(occupants.slice());
		w = me.openChatWindow(roomInfo);

		this.presentInvitationToast(roomInfo)
			.then(function () {
				me.ChatStore.setOccupantsKeyAccepted(roomInfo);
				w.accept(true);
				me.startTrackingChatState(roomInfo.get('Creator'), roomInfo, w);
				if (isGroupChat) {
					w.show();
				}
			})
			.catch(function () {
				// TODO: Check if this comment below is still valid
				//because we are using this callback for both the button and window close callback.	 There are 2 signatures,
				//we ignore one so we don't try to exit a room twice.
				logger.info('Declined invitation..: ', arguments);
				if (w && !w.isDestroyed) {
					me.leaveRoom(roomInfo);
					w.close();
				}
			});
	},

	openChatWindow: function (roomInfo) {
		var w = this.ChatStore.getChatWindow(roomInfo);

		if (!w) {
			w = Ext.widget({ xtype: 'chat-window', roomInfo: roomInfo });
			this.ChatStore.cacheChatWindow(w, roomInfo);
			this.ChatStore.putRoomInfoIntoSession(roomInfo);
			// this.fillInHistoryForOccupants(roomInfo.get('Occupants'), w);
		}
		return w;
	},

	resolveWindowForUsers: function (roomInfoId, users) {
		var me = this,
			allUsers = Ext.Array.unique(
				users.slice().concat($AppConfig.userObject.get('Username'))
			),
			occupantsKey = Ext.Array.sort(allUsers).join('_'),
			win = this.ChatStore.getWindow(occupantsKey);

		return new Promise(function (fulfill, reject) {
			Service.getObject(roomInfoId)
				.then(function (obj) {
					// If we have an existing window with the same occupants but different roomInfo.
					// Get the new roomInfo and then update the window rather than creating another one.
					if (win) {
						me.ChatStore.replaceChatRoomInfo(win, obj);
					} else {
						me.openChatWindow(obj);
					}
					fulfill(obj);
				})
				.catch(function () {
					logger.debug(
						'Could not resolve roomInfo for: ',
						roomInfoId
					);
					reject();
				});
		});
	},

	canShowChat: function (roomInfo) {
		var creator = roomInfo && roomInfo.get('Creator'),
			isGroupChat = roomInfo && roomInfo.isGroupChat();
		if (
			isMe(creator) ||
			!isGroupChat ||
			this.ChatStore.isOccupantsKeyAccepted(roomInfo.getOccupantsKey())
		) {
			return true;
		}

		return false;
	},

	presentInvitationToast: function (roomInfo) {
		var me = this,
			occupants = roomInfo.get('Occupants'),
			isGroupChat = occupants.length > 2;

		//Rules for auto-accepting are getting complicated, I will enumerate them here:
		//1) if it's not a group chat, accept if the creator is a contact.
		//2) regardless of group or not, if the room has been previously accepted, accept (like a refresh)
		//3) if you created it, accept

		if (this.canShowChat(roomInfo)) {
			return Promise.resolve();
		}

		return new Promise(function (fulfill, reject) {
			UserRepository.getUser(roomInfo.get('Creator')).then(function (u) {
				if (
					me.invitationToast &&
					me.invitationToast.roomId ===
						IdCache.getIdentifier(roomInfo.getId())
				) {
					// if we have a invitation toast for a roomInfo, don't create another one.
					return;
				}

				//at this point, window has been created but not accepted.
				me.invitationToast = Toaster.makeToast({
					roomId: IdCache.getIdentifier(roomInfo.getId()),
					title: isGroupChat ? 'Group Chat...' : 'Chat Invitation...',
					message: isGroupChat
						? "You've been invited to chat with <span>" +
						  (occupants.length - 1) +
						  '</span> friends.'
						: '<span>' +
						  u.getName() +
						  '</span> would like to chat.',
					iconCls: 'icons-chat-32',
					buttons: [
						{
							label: 'decline',
							callback: reject,
						},
						{
							label: 'accept',
							callback: fulfill,
						},
					],
					callback: function () {
						delete me.invitationToast;
					},
					scope: me,
				});
			});
		});
	},

	async sendMessage(f, mid, channel, recipients) {
		var room = this.getRoomInfoFromComponent(f),
			val = f.getValue();

		if (!room || Ext.isEmpty(val, false)) {
			logger.error('Cannot send message, room', room, 'values', val);
			return;
		}
		this.clearErrorForRoom(room);
		this.client.postMessage(
			await room.getInterfaceInstance(),
			ArrayUtils.ensure(val),
			mid,
			channel,
			recipients,
			Ext.bind(this.sendAckHandler, this)
		);

		f.focus();
	},

	/*
	 * NOTE: We will ONLY manage our state in all the rooms we're currently involved in.
	 */
	async publishChatStatus(room, newStatus, username) {
		var oldStatus;
		username =
			username && Ext.isString(username) ? username : $AppConfig.username;
		oldStatus = room.getRoomState(username || $AppConfig.username);
		if (oldStatus !== newStatus) {
			logger.trace(
				'transitioning room state for: ',
				$AppConfig.username,
				' from ',
				oldStatus,
				' to ',
				newStatus
			);
			this.client.postStatus(await room.getInterfaceInstance(), {
				state: newStatus,
			});
		}
	},

	onMessage: function (msg, opts) {
		var me = this,
			m = lazy.ParseUtils.parseItems([msg.__toRaw?.() || msg])[0],
			channel = m && m.get('channel'),
			cid = m && m.get('ContainerId'),
			w = this.ChatStore.getChatWindow(cid),
			pushNotification = opts && opts.pushNotification,
			occupants = [m.get('Creator'), $AppConfig.username];

		if (!w && !msg.handled) {
			// Use this to avoid get into a loop where we keep resolving the roomInfo (cid)
			msg.handled = true;

			// TODO: This is going to break for GroupChat,
			// since we might have more occupants than just the sender and the receiver (Me).
			// Group chat may have to depend on the roomInfo rather than occupants.
			// NOTE: If the getObject call on the roomInfoId fails, go ahead and create a new chat room
			this.resolveWindowForUsers(cid, occupants)
				.then(me.onMessage.bind(me, msg, opts))
				.catch(me.startChat.bind(me, occupants, { silent: true }));
			return;
		}

		this.channelMap[channel].call(this, m, opts || {});

		// FIXME: if we're adding a message as part of a chat transcript, do not push a notification.
		if (channel !== 'STATE' && pushNotification !== false) {
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

	onMessageDefaultChannel: function (msg, opts) {
		var cid, win, sender, room, isGroupChat;

		cid = msg.get('ContainerId');
		win = this.ChatStore.getChatWindow(cid);
		// moderated = Boolean(opts && opts.hasOwnProperty('moderated'));
		sender = msg.get('Creator');
		room = win && win.roomInfo;
		isGroupChat = room ? room.get('Occupants').length > 2 : false;
		this.updateChatState(sender, 'active', win, isGroupChat);
		if (win) {
			win.handleMessageFromChannel(sender, msg, room, isGroupChat);
		}
	},

	onReceiveStateChannel: function (msg) {
		var cid = msg.get('ContainerId'),
			body = msg.get('body'),
			sender = msg.get('Creator'),
			win = this.ChatStore.getChatWindow(cid),
			isGroupChat = win && win.roomInfo.get('Occupants').length > 2;

		if (win && body) {
			this.updateChatState(sender, body.state, win, isGroupChat);
		}
	},

	/*
	 *	We use this method to update the state of other chat participants.
	 *	Thus, it is responsible for updating the appropriate view,
	 *	but we don't keep track of other participants' state, because they manage it themselves.
	 */
	updateChatState: function (sender, state, win, isGroupChat, room) {
		if (!win || !sender || sender === '') {
			return;
		}

		room = room || win.roomInfo;
		if (room) {
			room.setRoomState(sender, state);
			// logger.info('Update chat state: set to ', state, ' for ', sender);
			win.updateChatState(sender, state, room, isGroupChat);
		}
	},

	startTrackingChatState: function (sender, room, w) {
		if (!w) {
			return;
		}
		this.updateChatState(
			sender,
			'active',
			w,
			room.get('Occupants').length > 2
		);
		if (isMe(sender) && w.down('chat-view')) {
			w.down('chat-view').fireEvent('status-change', { state: 'active' }); //start active timer.
		}
	},

	/* CLIENT EVENTS */

	sendAckHandler: function (result, m) {
		function isError(r) {
			var errorCode = 'error-type';
			return (
				r.hasOwnProperty(errorCode) && r[errorCode] === 'client-error'
			);
		}

		if (isError(result)) {
			this.onMessageError(result, m);
		}
	},

	getRoomInfoFromComponent: function (c) {
		if (!c) {
			logger.error('Cannot get RoomInfo from an undefined component.');
			return null;
		}

		if (c.roomInfo) {
			return c.roomInfo;
		}

		var o = c.up('[roomInfo]');

		if (!o) {
			logger.error(
				'The component',
				c,
				'has no parent component with a roomInfo'
			);
			return null;
		}

		return o.roomInfo;
	},

	onMessageError: function (errorObject, msg) {
		var cid, win, view;

		if (!msg) {
			//TODO what to do here, pop up something generic.
			logger.error(
				'No message object tied to error.	 Dropping error',
				errorObject
			);
			return;
		}

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?

		cid = msg.ContainerId;
		win = this.ChatStore.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if (view) {
			view.showError(errorObject);
		} else {
			logger.warn(
				'Error sending chat message but no chat view to show it in',
				msg,
				errorObject
			);
		}
	},

	clearErrorForRoom: function (room) {
		var cid, win, view;

		//TODO do we need to do the window rebuilding stuff here
		//like in onMessage?
		cid = room.getId();
		win = this.ChatStore.getChatWindow(cid);
		view = win ? win.down('chat-view') : null;
		if (view) {
			view.clearError();
		} else {
			logger.error(
				'Unable to clear error for messages window',
				arguments
			);
		}
	},

	onSocketDisconnect: function () {
		// NOTE: Keep the accepted list of accepted rooms, keyed by occupants.
		// We will use the list of previous chats to fill the gutter,
		// which comes in handy for chats with people we may not be following.
		this.ChatStore.removeAllRoomInfosFromSession();
	},

	onExitedRoom: function (room) {
		var occupants = room.occupants || [],
			key = Ext.Array.sort(occupants.slice()).join('_');

		this.ChatStore.removeSessionObject(key);
	},

	onMembershipOrModerationChanged: function (msg) {
		var newRoomInfo = lazy.ParseUtils.parseItems([
				msg.__toRaw?.() || msg,
			])[0],
			oldRoomInfo =
				newRoomInfo &&
				this.ChatStore.getRoomInfoFromSession(newRoomInfo.getId()),
			occupants = newRoomInfo && newRoomInfo.get('Occupants'),
			toast;

		if (
			newRoomInfo &&
			newRoomInfo.get('Moderators').length === 0 &&
			newRoomInfo.get('Moderated')
		) {
			logger.info(
				'Transient moderation change encountered, ignoring',
				newRoomInfo
			);
			return null;
		}

		this.sendChangeMessages(oldRoomInfo, newRoomInfo);
		this.ChatStore.updateRoomInfo(newRoomInfo);

		//if membership falls to just me, and we have a toast, DESTROY!
		if (
			occupants.length === 1 &&
			occupants[0] === $AppConfig.userObject.get('Username')
		) {
			toast = Ext.ComponentQuery.query(
				'toast[roomId=' +
					IdCache.getIdentifier(newRoomInfo.getId()) +
					']'
			);
			if (toast && toast.length === 1) {
				toast[0].close();
			}

			if (oldRoomInfo) {
				this.ChatStore.removeSessionObject(
					oldRoomInfo.getOccupantsKey()
				);
			}
		}

		return newRoomInfo; //for convenience chaining
	},

	sendChangeMessages: function (oldRoomInfo, newRoomInfo) {
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

	onOccupantsChanged: function (
		newRoomInfo,
		peopleWhoLeft,
		peopleWhoArrived
	) {
		var win = this.ChatStore.getChatWindow(newRoomInfo),
			log = win ? win.logView : null;

		if (!win) {
			return;
		}
		/*
		 if (this.isRoomEmpty(newRoomInfo)) {
		 tab.disableChat();
		 }
		 */
		Ext.each(peopleWhoLeft, function (p) {
			if (!isMe(p)) {
				UserRepository.getUser(
					p,
					function (u) {
						var name = u.getName();
						if (log) {
							log.addNotification(name + ' has left the chat...');
						}
					},
					this
				);
			}
		});

		Ext.each(peopleWhoArrived, function (p) {
			if (!isMe(p)) {
				UserRepository.getUser(
					p,
					function (u) {
						var name = u.getName();
						if (log) {
							log.addNotification(name + ' entered the chat...');
						}
					},
					this
				);
			}
		});
	},

	async leaveRoom(room) {
		this.client.exitRoom(await room.getInterfaceInstance());
	},

	fillInHistoryForOccupants: function (occupants, win) {
		var me = this,
			transcripts = this.ChatStore.getTranscripts();

		if (transcripts && transcripts.isLoading()) {
			transcripts.on({
				load: this.fillInHistoryForOccupants.bind(this, occupants, win),
			});
			return;
		}

		win.onceRendered.then(function () {
			win.logView.addMask();
		});

		Promise.all(me.loadHistoryForOccupants(occupants))
			.then(function (historyItems) {
				me.addMessagesForTranscript(win, historyItems);
			})
			.catch(function () {
				logger.warn(
					'Failed to load one of the chat transcripts: ',
					arguments
				);
			});
	},

	addMessagesForTranscript: function (win, transcripts) {
		var me = this,
			allMessages = [];

		if (transcripts && !Ext.isArray(transcripts)) {
			transcripts = [transcripts];
		}

		transcripts.forEach(function (transcript) {
			var messages = transcript ? transcript.get('Messages') : [];

			messages = me.sortMessages(messages);
			allMessages = allMessages.concat(messages);
		});

		win.addBulkMessages(allMessages);

		if (win.rendered) {
			win.logView.removeMask();
		} else {
			win.onceRendered.then(function () {
				win.logView.removeMask();
			});
		}
	},

	sortMessages: function (messages) {
		function timeSort(a, b) {
			var aRaw = a.raw || { CreatedTime: 0 },
				bRaw = b.raw || { CreatedTime: 0 };

			return aRaw.CreatedTime - bRaw.CreatedTime;
		}

		messages = Ext.Array.sort(messages, timeSort);
		return messages;
	},

	loadHistoryForOccupants: function (occupants) {
		if (!this.ChatStore.getTranscripts() || Ext.isEmpty(occupants)) {
			return [];
		}

		var summaries = [],
			me = this,
			transcripts = this.ChatStore.getTranscripts();

		occupants = (occupants || []).slice();
		occupants.sort();
		occupants = occupants.join('_');

		transcripts.each(function (item) {
			var o = (item.get('Contributors') || []).slice();
			o.sort();
			o = o.join('_');
			if (o === occupants) {
				summaries.push(item);
			}
		});

		// Reverse the array, so we can add the transcript from the oldest to most recent ones.
		return Ext.Array.map(summaries.reverse(), function (summary) {
			return me.loadTranscript(summary.get('RoomInfo'));
		});
	},

	loadTranscript: function (roomInfo) {
		var id = this.ChatStore.getTranscriptIdForRoomInfo(roomInfo);

		if (!id) {
			return Promise.reject({
				error: 'cannot retrieve transcript without a transcript id.',
			});
		}

		return Service.getObject(id);
	},

	zoomWhiteboard: function (cmp, data) {
		Ext.widget('wb-window', {
			width: 802,
			value: data,
			readonly: true,
		}).show();
	},

	replyToWhiteboard: function (wbData, cmp, midReplyOf, channel, recipients) {
		this.ChatStore.fireEvent(
			'show-whiteboard',
			wbData,
			cmp,
			midReplyOf,
			channel,
			recipients
		);
	},

	sendWhiteboard: function (chatEntryWidget, mid, channel, recipients) {
		this.ChatStore.fireEvent(
			'show-whiteboard',
			null,
			chatEntryWidget,
			mid,
			channel,
			recipients
		);
	},
});
