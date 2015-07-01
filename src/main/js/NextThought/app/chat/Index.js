Ext.define('NextThought.app.chat.Index', {
	extend: 'Ext.container.Container',
	alias: 'widget.chats-view',

	layout: 'none',

	cls: 'chat-container',

	requires: [
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.Gutter'
	],

	items: [],


	renderTpl: Ext.DomHelper.markup([
		{cls: 'gutter'},
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
	]),


	getTargetEl: function() { return this.body; },
	childEls: ['body'],

	renderSelectors: {
		gutter: '.gutter'
	},

	CHAT_WIN_MAP: {},


	initComponent: function() {
		this.callParent(arguments);

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.windows.Actions.create();

		this.mon(this.ChatStore, {
			'show-window': this.showChatWindow.bind(this),
			'close-window': this.closeWindow.bind(this)
		});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.gutterWin = Ext.widget('chat-gutter-window', {renderTo: this.gutter, autoShow: true});
	},


	showChatWindow: function(roomInfo) {
		var me = this, w;

		this.enterChatRoom(roomInfo);
		w = this.getChatWindow(roomInfo);
		if (w) {
			w.notify();
			w.show();
			wait(500)
				.then(function() {
					w.down('chat-entry').focus();
				});
		}
	},


	getChatWindow: function(r) {
		if (!r) { return null; }

		var rId = r && r.isModel ? r.getId() : r,
			id = IdCache.getIdentifier(rId),
			xOcc, w, allRooms;

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

				//Be defensive.
				if (Ext.Array.union(xOcc, r.get('Occupants')).length === xOcc.length) {
					console.log('found a different room with same occupants: ', xOcc);
					x.roomInfoChanged(r);
					w = x;
				}
			});
		}

		return w;
	},


	openChatWindow: function(roomInfo) {
		var w = this.getChatWindow(roomInfo),
			id = roomInfo && roomInfo.isModel ? roomInfo.getId() : roomInfo;

		if (!w) {
			w =  Ext.widget({xtype: 'chat-window', roomInfo: roomInfo});
			id = IdCache.getIdentifier(id);
			this.CHAT_WIN_MAP[id] = w;
		}
		return w;
	},


	enterChatRoom: function(roomInfo) {
		var me = this, w,
			occupants = roomInfo.get('Occupants'),
			isGroupChat = (occupants.length > 2);

		roomInfo = roomInfo && roomInfo.isModel ? roomInfo : ParseUtils.parseItems([roomInfo])[0];
		roomInfo.setOriginalOccupants(occupants.slice());
		// me.putRoomInfoIntoSession(roomInfo);
		w = me.openChatWindow(roomInfo);

		this.presentInvationationToast(roomInfo)
			.then(function() {
				// me.setRoomIdStatusAccepted(roomInfo.getId());
				w.accept(true);
				// me.startTrackingChatState(roomInfo.get('Creator'), roomInfo, w);
				if (isGroupChat) {
					w.show();
				}
			})
			.fail(function() {
				// TODO: Check if this comment below is still valid
				//because we are using this callback for both the button and window close callback.  There are 2 signatures,
				//we ignore one so we dont try to exit a room twice.
				console.log('Declined invitation..: ', arguments);
				if (w && !w.isDestroyed) {
					me.leaveRoom(roomInfo);
					w.close();
				}
			});
	},


	presentInvationationToast: function(roomInfo) {
		var me = this,
			occupants = roomInfo.get('Occupants'),
			isGroupChat = (occupants.length > 2);

		//Rules for auto-accepting are getting complicated, I will enumerate them here:
		//1) if it's not a group chat, accept
		//2) regardless of group or not, if the room has been previously accepted, accept (like a refresh)
		//3) if you created it, accept

		if (!isGroupChat || me.isRoomIdAccepted(roomInfo.getId()) || isMe(roomInfo.get('Creator'))) {
			return Promise.resolve();
		}

		return new Promise(function (fulfill, reject) {
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
							callback: reject
						},
						{
							label: 'accept',
							callback: fulfill
						}
					],
					callback: reject,
					scope: me
				});
			});
		});
	},

	closeWindow: function() {},

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
	}
});
