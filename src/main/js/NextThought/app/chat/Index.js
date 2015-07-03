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
		var socket;

		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();

		this.mon(this.ChatStore, {
			'show-window': this.showChatWindow.bind(this),
			'close-window': this.closeWindow.bind(this),
			'show-whiteboard': this.showWhiteboard.bind(this)
		});

		socket = this.ChatStore.getSocket();
		socket.register({'chat_enteredRoom': this.enterChatRoom.bind(this)});
	},


	afterRender: function() {
		this.callParent(arguments);
		this.gutterWin = Ext.widget('chat-gutter-window', {renderTo: this.gutter, autoShow: true});
	},


	showChatWindow: function(roomInfo) {
		var w;

		this.enterChatRoom(roomInfo);
		w = this.ChatStore.getChatWindow(roomInfo);
		if (w) {
			w.notify();
			w.show();
			wait(500)
				.then(function() {
					w.down('chat-entry').focus();
				});
		}
	},


	openChatWindow: function(roomInfo) {
		var w = this.ChatStore.getChatWindow(roomInfo);

		if (!w) {
			w =  Ext.widget({xtype: 'chat-window', roomInfo: roomInfo});
			this.ChatStore.cacheChatWindow(w, roomInfo);
		}
		return w;
	},


	enterChatRoom: function(msg) {
		var me = this, w,
			roomInfo = msg && msg.isModel ? msg : ParseUtils.parseItems([msg])[0],
			occupants = roomInfo.get('Occupants'),
			isGroupChat = (occupants.length > 2);

		roomInfo = roomInfo && roomInfo.isModel ? roomInfo : ParseUtils.parseItems([roomInfo])[0];
		roomInfo.setOriginalOccupants(occupants.slice());
		me.ChatStore.putRoomInfoIntoSession(roomInfo);
		w = me.openChatWindow(roomInfo);

		this.presentInvationationToast(roomInfo)
			.then(function() {
				me.ChatStore.setRoomIdStatusAccepted(roomInfo.getId());
				w.accept(true);
				me.ChatActions.startTrackingChatState(roomInfo.get('Creator'), roomInfo, w);
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
					me.ChatActions.leaveRoom(roomInfo);
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


	createWhiteBoard: function(data, ownerCmp, chatStatusEvent) {
		var win = Ext.widget('wb-window', {
			width: 802,
			value: data,
			chatStatusEvent: chatStatusEvent,
			ownerCmp: ownerCmp
		});

		return win;
	},


	showWhiteboard: function(data, cmp, mid, channel, recipients) {
		var me = this,
			room = this.ChatActions.getRoomInfoFromComponent(cmp),
			wbWin = this.createWhiteBoard(data, cmp, 'status-change'),
			wbData,
			scrollEl = cmp.up('.chat-view').el.down('.chat-log-view'),
			scrollTop = scrollEl.getScroll().top;

		//hook into the window's save and cancel operations:
		wbWin.on({
			save: function(win, wb) {
				wbData = wb.getValue();
				me.ChatActions.clearErrorForRoom(room);
				me.ChatActions.postMessage(room, [wbData], mid, channel, recipients, Ext.bind(me.sendAckHandler, me));
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
	}
});
