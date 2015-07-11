Ext.define('NextThought.app.chat.components.Window', {
	extend: 'Ext.window.Window',
	alias: 'widget.chat-window',

	requires: [
		'NextThought.app.chat.components.View',
		'NextThought.app.chat.components.Entry',
		'NextThought.app.chat.StateStore'
		// 'NextThought.view.chat.Gutter' //,
		// 'NextThought.view.chat.WindowManager'
	],

	cls: 'chat-window no-gutter',
	ui: 'chat-window',
	focusOnToFront: false,
	minimizable: true,

	constrain: true,
	width: 280,
	minWidth: 250,

	height: 325,
	minHeight: 325,
	header: false,

	title: 'chat',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	isOverlay: false,

	items: [
		{xtype: 'nti-window-header' },
		{xtype: 'chat-view', flex: 1}
	],

	// dockedItems: [
	// 	{xtype: 'chat-gutter', dock: 'left', hidden: true}
	// ],


	// tools: {
	// 	'add-people': {
	// 		tip: getString('NextThought.view.chat.Window.add-people-tooltip'),
	// 		handler: 'addPeople'
	// 	},
	// 	'flag-for-moderation': {
	// 		tip: getString('NextThought.view.chat.Window.flag-tooltip'),
	// 		handler: 'onFlagToolClicked'
	// 	}
	// },


	syncHeight: Ext.emptyFn, //chat windows won't need this.

	initComponent: function() {
		this.callParent(arguments);

		// this.on({
		// 	scope: this,
		// 	'close': this.dragMaskOff,
		// 	'hide': this.dragMaskOff
		// });
		this.titleBar = this.down('nti-window-header');
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.setChatStatesMap();
		this.logView = this.down('chat-log-view');
		this.entryView = this.down('chat-entry');

		this.on({
			'beforedestroy': this.onDestroy.bind(this),
			'beforeshow': this.beforeWindowShow.bind(this),
			'show': this.onWindowShow.bind(this)
		});

		this.roomInfoChanged(this.roomInfo);
		// this.mon(Ext.getStore('PresenceInfo'), 'presence-changed', 'presenceChanged', this);
	},


	setTitle: function(title) {
		if (this.titleBar) {
			this.titleBar.update(title);
			this.fireEvent('titleChange', this, title);
		}
	},


	getTitle: function() {
		var title;
		if (this.titleBar) {
			title = this.titleBar.getTitle();
		}
		return title || 'Untitled';
	},


	onDestroy: function() {
		if (!this.disableExitRoom) {
			this.ChatActions.leaveRoom(this.ChatActions.getRoomInfoFromComponent(this));
		}
	},


	onWindowShow: function() {
		var me = this;
		wait(500)
			.then(function() {
				if(me.entryView && !me.entryView.disabled) {
					me.entryView.focus();
				}
			});
	},


	beforeWindowShow: function(winToShow) {
		var wins = this.ChatStore.getAllChatWindows() || [];

		// Hide all other open chat windows
		wins.forEach(function(win) {
			if ((win !== winToShow) && win.isVisible()) {
				win.minimize();
			}
		});
	},


	fixScroll: Ext.emptyFn,//don't "fixScroll" in chat windows.

	roomInfoChanged: function(roomInfo) {
		if (!this.roomInfo) {
			return;
		}  //Only do this if it's there.

		var list = this.down('chat-gutter'),
				me = this,
				newOccupants = roomInfo.get('Occupants'),
				oldOccupants = this.roomInfo.get('Occupants'),
				whoLeft = Ext.Array.difference(oldOccupants, newOccupants),
				isGroupChat = this.roomInfo.get('Occupants').length > 2,
				logView = me.down('chat-log-view'),
				chatView = me.down('chat-entry');

		//don't assume we have the chat-log-view or chat-entry
		if (!logView || !chatView) {
			return;
		}

		//Even though the occupants list changes, the original occupants stays the same.
		roomInfo.setOriginalOccupants(this.roomInfo.getOriginalOccupants());
		//stop listening on old room info, reassign and start listening again.
		this.roomInfo.un('changed', this.roomInfoChanged, this);
		this.roomInfo = roomInfo;
		this.roomInfo.on('changed', this.roomInfoChanged, this);
		this.roomInfoHash = IdCache.getIdentifier(roomInfo.getId());

		//Update the presence of the users
		me.onlineOccupants = me.onlineOccupants || [];

		UserRepository.getUser(roomInfo.get('Occupants'), function(users) {

			Ext.each(users, function(u) {
				var name = u.getId(),
					presence = me.ChatStore.getPresenceOf(name);

				//if we don't have a presence for them or they are online add them to onlineOccupants
				if (!presence || presence.isOnline()) {
					Ext.Array.include(me.onlineOccupants, name);
				} else {

					Ext.Array.remove(me.onlineOccupants, u.getId());

					if (!isMe(name)) {
						me.updateDisplayState(u.getName(), 'unavailable', isGroupChat);
						if (logView.addStatusNotifcation) {
							logView.addStatusNotification(u.getName() + ' is unavailable');
						}
					}
				}
			});

			if (newOccupants && newOccupants.length === 1 && isMe(newOccupants[0])) {
				chatView.disable();
				if (logView.addStatusNotification) {
					logView.addStatusNotification(getString('NextThought.view.chat.Window.one-occupant'));
				}
			} else if (me.onlineOccupants && me.onlineOccupants.length <= 1) {
				chatView.disable();
				if (logView.addSatusNotification) {
					logView.addSatusNotification(getString('NextThought.view.chat.Window.one-occupantb'));
				}
			} else {
				if (Ext.isEmpty(me.query('chat-log-entry'))) {
					Ext.each(me.query('chat-notification-entry'), function(el) {
						el.destroy();
					});
				}
				chatView.enable();
			}

			if (newOccupants.length > 1) {
				me.setTitleInfo(users);
				// list.updateList(users);
			} else {
				console.log('Users who left the chat: ', whoLeft);
				Ext.each(whoLeft, function(aUser) {
					me.updateDisplayState(aUser, getString('NextThought.view.chat.Window.gone'), isGroupChat);
				});
			}
		});
	},

	presenceChanged: function(username, value) {
		var me = this,
				logView = me.down('chat-log-view'),
				entryView = me.down('chat-entry');

		//ignore people who aren't in the occupants list, return if we don't have the chat-log-view or chat-entry
		if (!entryView || !logView || !Ext.Array.contains(me.roomInfo.get('Occupants'), username)) {
			return;
		}

		if (me.onlineOccupants.length === 0) {
			//the presence store didn't have info for the occupants
			me.roomInfo.fireEvent('changed', me.roomInfo);
			return;
		}

		UserRepository.getUser(username, function(user) {
			var isGroup = me.roomInfo.get('Occupants').length > 2,
					displayName = user.getName();

			if (isMe(user)) {
				return;
			}//ignore the presence changes from yourself

			if (!value.isOnline()) {
				Ext.Array.remove(me.onlineOccupants, username);
				logView.clearChatStatusNotifications();
				logView.addStatusNotification(getFormattedString('NextThought.view.chat.Window.user-unavailable', {name: displayName}));
				me.updateDisplayState(user.getName(), getString('NextThought.view.chat.Window.unavailable'), isGroup);

				if (me.onlineOccupants.length <= 1) {
					entryView.disable();
					logView.addStatusNotification(getString('NextThought.view.chat.Window.one-occupantb'));
				}
			} else {
				if (!Ext.Array.contains(me.onlineOccupants, username)) {
					Ext.Array.push(me.onlineOccupants, username);
					entryView.enable();
					me.updateDisplayState(user.getName(), getString('NextThought.view.chat.Window.available'), isGroup);
					logView.clearChatStatusNotifications();
					logView.addStatusNotification(getFormattedString('NextThought.view.chat.Window.user-available', {name: displayName}));
				}
			}
		});
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		// function getEl(c, sub) { return Ext.get(c.getId() + '-' + sub); }

		// this.dropZone = Ext.dd.DropZone.create(this.getEl(), {

		// 	getTargetFromEvent: function(e) {
		// 		return e.getTarget('.chat-window');
		// 	},
		// 	onNodeEnter: function(target, dd, e, data) {
		// 		Ext.fly(target).addCls('target-hover');
		// 	},
		// 	onNodeOut: function(target, dd, e, data) {
		// 		Ext.fly(target).removeCls('target-hover');
		// 	},

		// 	onNodeOver: function(target, dd, e, data) {
		// 		if (data && data.Username) {
		// 			return Ext.dd.DropZone.prototype.dropAllowed;
		// 		}
		// 	},

		// 	onNodeDrop: function(target, dd, e, data) {
		// 		//				me.fireEvent('add-people', me, [data.username]);
		// 		return true;
		// 	}
		// });
	},


	addPeople: function() {
		//this doesn't do what it should, its only toggling the gutter to play with the tool wiring.
		var list = this.down('chat-gutter');
		if (list.isHidden()) {
			list.show();
		} else {
			list.hide();
		}

		if (Ext.isWebKit) {
			//changing the visibilty of the gutter causes WebKit to fail to draw the window...lets toggle some stuff to trigger it to come back.
			this.mask();
			Ext.defer(this.unmask, 100, this);
		}

		//TODO: actually show an interface to add people to the conversation instead of playing with the gutter.
	},


	handleMessageFromChannel: function(sender, msg, room, isGroupChat) {
		var r = room || this.roomInfo;
		this.logView.addMessage(msg);
		this.updateChatState(sender, 'active', r, isGroupChat);
	},


	/**
	 *  We use this method to update the state of other chat participants.
	 *  Thus, it is responsible for updating the appropriate view,
	 *  but we don't keep track of other participants' state, because they manage it themselves.
	 */
	updateChatState: function(sender, state, room, isGroupChat) {
		if (!sender || sender === '') {
			return;
		}

		var wasPreviouslyInactive = room.getRoomState(sender) === 'inactive' || !room.getRoomState(sender),
			inputStates;

		this.logView.clearChatStatusNotifications();
		inputStates = room.getInputTypeStates();

		if (inputStates.length > 0) {
			this.logView.showInputStateNotifications(inputStates);

			// NOTE: if the user is typing that means he is active.
			if (!wasPreviouslyInactive) { return; }
			state = 'active';
		}

		this.updateDisplayState(sender, state, isGroupChat);
	},


	onFlagToolClicked: function() {
		var logView = this.down('chat-log-view'),
				chatView = this.down('.chat-view'),
				btn = this.el.down('.flag-for-moderation');

		logView.toggleModerationPanel();
		chatView.toggleModerationButtons();
		btn.toggleCls('moderating');
	},


	setTitleInfo: function(users) {
		var title = [];

		Ext.each(users, function(u) {
			if (!isMe(u)) {
				title.push(u.getName());
			}
		});

		if (title.length === 1) {
			title = title[0];
		}
		else {
			title = getFormattedString('NextThought.view.chat.Window.occupantcount', {number: title.length});
		}

		this.setTitle(title);
	},


	updateDisplayState: function(targetUser, state, isGroupChat) {
		UserRepository.getUser(targetUser, function(u) {
			var name = u.getName(), txt,
					displayState = this.chatUserStatesMap[state] || state;
			if (isGroupChat) {
				this.down('chat-gutter').setChatState(displayState, name);
			}
			else if (!isGroupChat && !isMe(targetUser)) {
				txt = getFormattedString('NextThought.view.chat.Window.occupantstatus', {
					name: Ext.String.ellipsis(name, 16, false),
					status: displayState
				});
				this.setTitle(txt);
			}
		}, this);
	},


	notify: function(msg) {
		this.fireEvent('notify', msg);
	},
	minimize: function() {
		this.hide();
	},


	setChatStatesMap: function() {
		this.chatUserStatesMap = {
			'composing': getString('NextThought.view.chat.Window.componsingstate'),
			'inactive': getString('NextThought.view.chat.Window.inactivestate'),
			'gone': getString('NextThought.view.chat.Window.gonestate'),
			'active': getString('NextThought.view.chat.Window.activestate')
		};
	},


	disableChat: function() {
		this.down('chat-log-view').setDisabled(true);
		this.down('chat-entry').setDisabled(true);
	},


	left: function() {
		this.down('chat-entry').destroy();
	},


	accept: function(b) {
		this.chatAccepted = b;
	},


	hasBeenAccepted: function() {
		return this.chatAccepted;
	}
});