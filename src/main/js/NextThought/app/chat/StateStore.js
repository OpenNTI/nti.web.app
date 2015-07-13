Ext.define('NextThought.app.chat.StateStore', {
	extend: 'NextThought.common.StateStore',

	requires: [
		'NextThought.model.RoomInfo'
	],

	availableForChat: false,

	PRESENCE_MAP: {},

	STATE_KEY: 'chats',

	CHAT_WIN_MAP: {},

	getSocket: function() {
		if (!this.socket) {
			this.socket = Socket;
		}

		return this.socket;
	},


	setMySelfOffline: function() {
		var me = this;

		me.didSetMySelfOffline = true;

		wait(5000)
			.then(function() {
				me.didSetMySelfOffline = false;
			});
	},


	getPresenceOf: function(user) {
		var username = (user && user.isModel) ? user.get('Username') : user;

		if (!username) { return; }

		return this.PRESENCE_MAP[username];
	},


	/**
	 * Update the presence of a user, if it is the current user and they went offline
	 * in another session, give them a chance to come back online.
	 *
	 * @param {String} username       id of the user the presence if for
	 * @param {PresenceInfo} presence       the presence
	 * @param {Function} changePresence what to call if they do set themselves online
	 */
	setPresenceOf: function(username, presence, changePresence) {
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
								callback: function() {
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


	showChatWindow: function(roomInfo) {
		this.fireEvent('show-window', roomInfo);
	},


	notify: function(win, msg) {
		var creator = msg && msg.isModel ? msg.get('Creator') : msg && msg.Creator;
		if (!isMe(creator)) {
			this.fireEvent('notify', win, msg);
		}
	},


	getChatWindow: function(roomInfo) {
		if (!roomInfo) { return null; }

		var rIsString = (typeof roomInfo === 'string'),
			rId = roomInfo && roomInfo.isModel ? roomInfo.getId() : roomInfo,
			id = IdCache.getIdentifier(rId),
			xOcc, w, allRooms, me = this;

		w = this.getWindow(id);

		if (!w) {
			allRooms = this.getAllChatWindows();
			//see if we have rooms with the same occupants list:
			Ext.each(allRooms, function(x) {
				xOcc = x.roomInfo.getOriginalOccupants();
				//only do the next step for 1 to 1 chats, group chat changes like this could really mess everyone else up.
				if (xOcc.length > 2) {
					return;
				}

				if (rIsString) {
					return;
				}

				//Be defensive.
				if ( roomInfo.isModel && Ext.Array.union(xOcc, roomInfo.get('Occupants')).length === xOcc.length) {
					console.debug('found a different room with same occupants: ', xOcc);

					// Delete the old cache
					console.debug('deleting the cache for the old room info: ', x.roomInfo.getId());
					me.deleteRoomIdStatusAccepted(x.roomInfo && x.roomInfo.getId());

					// Change the roomInfo to the new one.
					x.roomInfoChanged(roomInfo);

					// Cache the new room to make sure the map that the store has is in sync
					console.debug('caching new room info: ', roomInfo.getId());
					me.cacheChatWindow(x, roomInfo);

					w = x;
					return false;
				}
			});
		}

		return w;
	},


	cacheChatWindow: function(win, roomInfo) {
		var rid = roomInfo && roomInfo.isModel ? roomInfo.getId() : roomInfo,
			id = IdCache.getIdentifier(rid);

		// We need to ensure that each chat window is tied to one chat room
		for(var k in this.CHAT_WIN_MAP) {
			if(this.CHAT_WIN_MAP.hasOwnProperty(k)) {
				if(this.CHAT_WIN_MAP[k] === win) {
					console.debug('Room info: ' + k + ' and Room info: ' + rid + ' have the same chat window.');
					console.debug('Delete roomInfo record: ', k);
					delete this.CHAT_WIN_MAP[k];
				}
			}
		}

		this.CHAT_WIN_MAP[id] = win;

		this.fireEvent('added-chat-window', win);
	},


	getWindow: function(id) {
		return this.CHAT_WIN_MAP[id];
	},


	getAllChatWindows: function() {
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
			allUsers = Ext.Array.unique(users.slice().concat($AppConfig.userObject.get('Username'))),
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


	putRoomInfoIntoSession: function(roomInfo) {
		if (!roomInfo) {
			Ext.Error.raise('Requires a RoomInfo object');
		}
		var roomData = roomInfo.getData();
		roomData.originalOccupants = roomInfo.getOriginalOccupants();
		//		console.log('****** setting original occupants of room', roomInfo.getId(), ' to: ', roomInfo.getOriginalOccupants());

		this.setSessionObject(roomData, roomInfo.getId());
	},


	/**
	 *
	 * @param {String} [key] Optional sub-key
	 * @return {*}
	 */
	getSessionObject: function(key) {
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
	 *              the whole session object.
	 */
	setSessionObject: function(o, key) {
		var leaf = o;
		if (!Ext.isEmpty(key)) {
			o = this.getSessionObject();
			o[key] = leaf;
		}

		TemporaryStorage.set(this.STATE_KEY, o);
	},


	removeSessionObject: function(key) {
		if (!Ext.isEmpty(key)) {
			var o = this.getSessionObject();
			delete o[key];
			this.setSessionObject(o);
			return;
		}
		TemporaryStorage.remove('chats');
	},


	isPersistantRoomId: function(id) {
		return (/meetingroom/i).test(id);
	},


	isRoomIdAccepted: function(id) {
		return Boolean((this.getSessionObject('roomIdsAccepted') || {})[id]);
	},


	setRoomIdStatusAccepted: function(id) {
		var key = 'roomIdsAccepted',
				status = this.getSessionObject(key) || {};

		status[id] = true;

		this.setSessionObject(status, key);
	},


	deleteRoomIdStatusAccepted: function(id) {
		var key = 'roomIdsAccepted',
			status = this.getSessionObject(key),
			hashId = IdCache.getIdentifier(id);

		if (!status) {
			return;
		}

		delete status[id];
		delete this.CHAT_WIN_MAP[hashId];
		this.setSessionObject(status, key);
		this.fireEvent('exited-room', id);
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


	updateRoomInfo: function(ri) {
		var win = this.getChatWindow(ri.getId()),
				ro = win ? win.roomInfo : this.getRoomInfoFromSession(ri.getId());
		if (ro) {
			ro.fireEvent('changed', ri);
		}
		this.putRoomInfoIntoSession(ri);
	},


	buildTranscriptId: function(roomInfoId, uname, type) {
		var id = ParseUtils.parseNTIID(roomInfoId);

		if (!id) {
			return null;
		}
		id.specific.provider = uname;
		id.specific.type = type;

		return id;
	},


	getTranscriptIdForRoomInfo: function(roomInfo) {
		var isString = typeof roomInfo === 'string',
			roomInfoId = isString ? roomInfo : roomInfo.getId(),
			user = isString ? $AppConfig.username : roomInfo.get('Creator');

		return this.buildTranscriptId(roomInfoId, user, 'Transcript');
	},


	getTranscriptSummaryForRoomInfo: function(roomInfo) {
		var id = roomInfo.isModel ? roomInfo.getId() : roomInfo;

		return this.buildTranscriptId(id, $AppConfig.username.replace('-', '_'), 'Transcript');
	}
});
