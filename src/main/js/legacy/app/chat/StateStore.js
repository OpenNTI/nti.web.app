const Ext = require('extjs');
const {wait} = require('nti-commons');

const Toaster = require('legacy/common/toast/Manager');
const lazy = require('legacy/util/lazy-require')
	.get('ParseUtils', ()=> require('legacy/util/Parsing'));
const Socket = require('legacy/proxy/Socket');
const RoomInfo = require('legacy/model/RoomInfo');
const {isMe} = require('legacy/util/Globals');
const {TemporaryStorage} = require('legacy/cache/AbstractStorage');

require('legacy/common/StateStore');

module.exports = exports = Ext.define('NextThought.app.chat.StateStore', {
	extend: 'NextThought.common.StateStore',
	availableForChat: false,
	PRESENCE_MAP: {},
	STATE_KEY: 'chats',
	CHAT_WIN_MAP: {},
	ROOM_USER_MAP: {},

	getSocket: function () {
		if (!this.socket) {
			this.socket = Socket;
		}

		return this.socket;
	},

	setMySelfOffline: function () {
		var me = this;

		me.didSetMySelfOffline = true;

		wait(5000)
			.then(function () {
				me.didSetMySelfOffline = false;
			});
	},

	getPresenceOf: function (user) {
		var username = (user && user.isModel) ? user.get('Username') : user;

		if (!username) { return; }

		return this.PRESENCE_MAP[username];
	},

	/**
	 * Update the presence of a user, if it is the current user and they went offline
	 * in another session, give them a chance to come back online.
	 *
	 * @param {String} username		  id of the user the presence if for
	 * @param {PresenceInfo} presence		the presence
	 * @param {Function} changePresence what to call if they do set themselves online
	 * @returns {void}
	 */
	setPresenceOf: function (username, presence, changePresence) {
		var prevToast = this.__offlineToast,
			oldPresence;

		if (isMe(username)) {
			//if we are online we are available for chat
			if (presence.isOnline()) {
				this.availableForChat = true;

				if (prevToast) {
					prevToast.destroy();
				}
			} else {
				oldPresence = this.PRESENCE_MAP[username];

				//if we didn't trigger being offline and our old presence was online alert the user
				if (!this.didSetMySelfOffline && oldPresence && oldPresence.isOnline()) {
					console.log('Set offline in another session');
					this.didSetMySelfOffline = false;

					if (prevToast) {
						prevToast.destroy();
					}

					this.__offlineToast = Toaster.makeToast({
						id: 'revertToast',
						message: 'You are currently unavailable because you went offline in another session.',
						buttons: [
							{
								label: 'Okay'
							},
							{
								label: 'Set to available',
								callback: function () {
									presence.set({type: 'available', show: 'chat'});
									changePresence(presence);
								}
							}
						]
					});
				}
			}
		}

		this.PRESENCE_MAP[username] = presence;

		this.fireEvent('presence-changed', username, presence);
	},

	showChatWindow: function (roomInfo) {
		this.fireEvent('show-window', roomInfo);
	},

	fireGutterToggle: function () {
		// The chat gutter should always be visible except in case the viewport width is too small (i.e width < 1024)
		// In those cases, we will use this event to show and hide the gutter.
		this.fireEvent('toggle-gutter');
	},

	notify: function (win, msg) {
		var creator = msg && msg.isModel ? msg.get('Creator') : msg && msg.Creator;
		if (!isMe(creator)) {
			this.fireEvent('notify', win, msg);
		}
	},

	getChatWindow: function (roomInfo) {
		var rIsString = (typeof roomInfo === 'string'),
			w, occupantsKey;

		if (!rIsString && roomInfo) {
			occupantsKey = roomInfo.getOccupantsKey();
		}
		else if (rIsString) {
			occupantsKey = this.ROOM_USER_MAP[roomInfo];
		}

		if (occupantsKey) {
			w = this.getWindow(occupantsKey);
		}

		return w;
	},

	replaceChatRoomInfo: function (chatWindow, newRoom) {
		var oldRoom = chatWindow.roomInfo,
			occupantsKey = newRoom && newRoom.getOccupantsKey(),
			me = this;

		if (!oldRoom || !newRoom || oldRoom.getId() === newRoom.getId()) {
			return;
		}

		if (occupantsKey !== oldRoom.getOccupantsKey()) {
			console.warn('Chat room occupants key are not identical. New key: ',
				occupantsKey, ' and old key: ', oldRoom.getOccupantsKey());
		}

		// Delete the old cache
		console.debug('deleting the cache for the old room info: ', oldRoom.getId());
		me.removeSessionObject(occupantsKey);

		// Change the roomInfo to the new one.
		chatWindow.roomInfoChanged(newRoom);

		// Cache the new room to make sure the map that the store is in sync
		console.debug('caching new room info : ', newRoom.getId());
		me.CHAT_WIN_MAP[occupantsKey] = chatWindow;
		me.ROOM_USER_MAP[newRoom.getId()] = occupantsKey;
		me.putRoomInfoIntoSession(newRoom);
	},

	cacheChatWindow: function (win, roomInfo) {
		var rid = roomInfo && roomInfo.isModel ? roomInfo.getId() : roomInfo,
			occupantsKey = roomInfo && roomInfo.getOccupantsKey();

		this.CHAT_WIN_MAP[occupantsKey] = win;
		this.ROOM_USER_MAP[rid] = occupantsKey;
		this.fireEvent('added-chat-window', win);
	},

	getWindow: function (id) {
		return this.CHAT_WIN_MAP[id];
	},

	getAllChatWindows: function () {
		var wins = [];
		for(var k in this.CHAT_WIN_MAP) {
			if(this.CHAT_WIN_MAP.hasOwnProperty(k)) {
				wins.push(this.CHAT_WIN_MAP[k]);
			}
		}

		return wins;
	},

	/**
	 * Check to see if a room already exists.  A room exists when any of the following conditions are met, in this order:
	 *1) if there's a roomId sent.	there must be an existing roomId in the active rooms object.
	 *2) if no roomId is sent, then look for a room with the same constituants, that room must not be a group/class.
	 *
	 * @param {Array} users list of users
	 * @param {String} roomId roomid
	 * @param {Object} options options
	 * @return {NextThought.model.RoomInfo} RoomInfo
	 */
	existingRoom: function (users, roomId) {
		var allUsers = Ext.Array.unique(users.slice().concat($AppConfig.userObject.get('Username'))),
			occupantsKey = Ext.Array.sort(allUsers).join('_');

		console.debug('Checking for existing room for occupants key: ', occupantsKey, ' and roomInfo id: ', roomId);
		return this.getRoomInfoFromSession(occupantsKey);
	},

	putRoomInfoIntoSession: function (roomInfo) {
		if (!roomInfo) {
			console.error('Requires a RoomInfo object');
			return;
		}

		var roomData = roomInfo.getData(),
			key = roomInfo.getOccupantsKey();

		roomData.originalOccupants = roomInfo.getOriginalOccupants();
		console.debug('****** caching roomInfo: ', roomInfo.getId(), ' to: ', key);

		this.setSessionObject(roomData, key);
	},

	/**
	 *
	 * @param {String} [key] Optional sub-key
	 * @return {*} object
	 */
	getSessionObject: function (key) {
		var o = TemporaryStorage.get(this.STATE_KEY) || {};
		if (!Ext.isEmpty(key)) {
			return o[key];
		}
		return o;
	},

	/**
	 *
	 * @param {Object} o Value to put into session storage.
	 * @param {String} [key] Optional key. If present, `o` is assumed to be the new value at the `key` instead of
	 *				the whole session object.
	 * @returns {void}
	 */
	setSessionObject: function (o, key) {
		var leaf = o;
		if (!Ext.isEmpty(key)) {
			o = this.getSessionObject();
			o[key] = leaf;
		}

		TemporaryStorage.set(this.STATE_KEY, o);
	},

	removeSessionObject: function (key) {
		if (!Ext.isEmpty(key)) {
			var o = this.getSessionObject();
			delete o[key];
			this.setSessionObject(o);
			return;
		}
		TemporaryStorage.remove('chats');
	},

	isPersistantRoomId: function (id) {
		return (/meetingroom/i).test(id);
	},

	isOccupantsKeyAccepted: function (id) {
		return Boolean((this.getSessionObject('roomIdsAccepted') || {})[id]);
	},

	setOccupantsKeyAccepted: function (roomInfo) {
		var key = 'roomIdsAccepted',
			occupantsKey = roomInfo.getOccupantsKey(),
			status = this.getSessionObject(key) || {};

		status[occupantsKey] = true;
		this.setSessionObject(status, key);
	},

	deleteOccupantsKeyAccepted: function (roomInfo) {
		var key = 'roomIdsAccepted',
			status = this.getSessionObject(key),
			occupantsKey = roomInfo.getOccupantsKey();

		if (!status) {
			return;
		}

		delete status[occupantsKey];
		delete this.CHAT_WIN_MAP[occupantsKey];
		this.setSessionObject(status, key);
		this.fireEvent('exited-room', roomInfo.getId());
	},

	getAllOccupantsKeyAccepted: function () {
		var accepted = this.getSessionObject('roomIdsAccepted') || {},
			pairs = [], key;

		for (key in accepted) {
			if (accepted.hasOwnProperty(key)) {
				pairs.push(key);
			}
		}

		return pairs;
	},

	getRoomInfoFromSession: function (key, json) {
		if (!key) {
			Ext.Error.raise('Requires key to look up RoomInfo');
		}

		var m;
		json = json || this.getSessionObject(key);

		if (json) {
			try {
				m = new RoomInfo(json);
				m.setOriginalOccupants(json.originalOccupants);
				return m;
			}
			catch (e) {
				console.warn('Item in session storage is not a roomInfo', json);
			}
		}
		return null; //not there
	},

	getAllRoomInfosFromSession: function () {
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

	removeAllRoomInfosFromSession: function () {
		var chats = this.getSessionObject(),
			o = chats['roomIdsAccepted'];

		this.setSessionObject(this.STATE_KEY, o);
	},

	updateRoomInfo: function (ri) {
		var win = this.getChatWindow(ri.getId()),
			ro = win ? win.roomInfo : this.getRoomInfoFromSession(ri.getId());
		if (ro) {
			ro.fireEvent('changed', ri);
		}
		this.putRoomInfoIntoSession(ri);
	},

	buildTranscriptId: function (roomInfoId, uname, type) {
		var id = lazy.ParseUtils.parseNTIID(roomInfoId);

		if (!id) {
			return null;
		}
		id.specific.provider = uname;
		id.specific.type = type;

		return id;
	},

	getTranscriptIdForRoomInfo: function (roomInfo) {
		var id = roomInfo.isModel ? roomInfo.getId() : roomInfo;
		return this.buildTranscriptId(id, $AppConfig.username.replace('-', '_'), 'Transcript');
	},

	getTranscripts: function () {
		return this.__transcriptStore;
	}
});
