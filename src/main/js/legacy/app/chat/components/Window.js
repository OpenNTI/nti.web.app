var Ext = require('extjs');
var IdCache = require('../../../cache/IdCache');
var UserRepository = require('../../../cache/UserRepository');
var User = require('../../../model/User');
var MixinsProfileLinks = require('../../../mixins/ProfileLinks');
var ComponentsView = require('./View');
var ComponentsEntry = require('./Entry');
var ChatStateStore = require('../StateStore');
var GroupsActions = require('../../groups/Actions');
var GroupsStateStore = require('../../groups/StateStore');
var TranscriptPager = require('../transcript/Pager');
var {isMe} = require('legacy/util/Globals');


module.exports = exports = Ext.define('NextThought.app.chat.components.Window', {
	extend: 'Ext.window.Window',
	alias: 'widget.chat-window',

	mixins: {
		profileLinks: 'NextThought.mixins.ProfileLinks'
	},

	activeStates: ['active', 'composing', 'paused'],
	cls: 'chat-window no-gutter',
	ui: 'chat-window',
	focusOnToFront: false,
	minimizable: true,
	constrain: true,
	width: 280,
	minWidth: 250,
	height: 425,
	minHeight: 325,
	header: false,
	closeAction: 'hide',
	title: 'chat',

	layout: {
		type: 'vbox',
		align: 'stretch'
	},

	isOverlay: false,

	items: [
		{
			xtype: 'nti-window-header',
			tools: {
				'settings': {
					title: 'Settings',
					'tip': 'Settings',
					handler: 'showSettings'
				}
			}
		},
		{xtype: 'chat-view', flex: 1}
	],

	// dockedItems: [
	//	{xtype: 'chat-gutter', dock: 'left', hidden: true}
	// ],


	// tools: {
	//	'add-people': {
	//		tip: getString('NextThought.view.chat.Window.add-people-tooltip'),
	//		handler: 'addPeople'
	//	},
	//	'flag-for-moderation': {
	//		tip: getString('NextThought.view.chat.Window.flag-tooltip'),
	//		handler: 'onFlagToolClicked'
	//	}
	// },


	syncHeight: Ext.emptyFn,

	//chat windows won't need this.

	initComponent: function() {
		this.callParent(arguments);

		// this.on({
		//	scope: this,
		//	'close': this.dragMaskOff,
		//	'hide': this.dragMaskOff
		// });
		this.titleBar = this.down('nti-window-header');
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.GroupActions = NextThought.app.groups.Actions.create();
		this.GroupStore = NextThought.app.groups.StateStore.getInstance();

		this.Pager = NextThought.app.chat.transcript.Pager.create();
		this.Pager.bindWindow(this);

		this.setChatStatesMap();
		this.logView = this.down('chat-log-view');
		this.entryView = this.down('chat-entry');

		this.on({
			'beforedestroy': this.beforeWindowDestroy.bind(this),
			'beforeshow': this.beforeWindowShow.bind(this),
			'show': this.onWindowShow.bind(this)
		});

		this.ChatStore.on({
			'presence-changed': this.presenceChanged.bind(this)
		});

		this.roomInfoChanged(this.roomInfo);
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

	beforeWindowDestroy: function() {
		if (!this.disableExitRoom) {
			this.ChatActions.leaveRoom(this.roomInfo);
		}
	},

	onWindowShow: function() {
		var me = this;
		me.updateChatViews();
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

	fixScroll: Ext.emptyFn,

	//don't "fixScroll" in chat windows.

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

		if (!this.historySet) {
			me.maskWindow();
			me.Pager.buildTranscriptStore(roomInfo.get('Occupants'));
		}
		this.historySet = true;

		UserRepository.getUser(roomInfo.get('Occupants'), function(users) {

			Ext.each(users, function(u) {
				var name = u.getId(),
					presence = me.ChatStore.getPresenceOf(name);

				// Cache the user for 1-1 chats.
				if (!isGroupChat && !isMe(u)) {
					me.user = u;
				}

				//if we don't have a presence for them or they are online add them to onlineOccupants
				if (presence && presence.isOnline()) {
					Ext.Array.include(me.onlineOccupants, name);
				} else {

					Ext.Array.remove(me.onlineOccupants, u.getId());

					if (!isMe(name)) {
						me.updateDisplayState(u, 'unavailable', isGroupChat);
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
				// console.log('Users who left the chat: ', whoLeft);
				Ext.each(whoLeft, function(aUser) {
					me.updateDisplayState(aUser, getString('NextThought.view.chat.Window.gone'), isGroupChat);
				});
			}
		});
	},

	updateChatViews: function() {
		var me = this,
			onlineOccupants = [],
			logView = me.down('chat-log-view'),
			chatView = me.down('chat-entry'),
			myPresence = me.ChatStore.getPresenceOf($AppConfig.userObject.get('Username'));

		UserRepository.getUser(this.roomInfo.get('Occupants'), function(users) {
			Ext.each(users, function(u) {
				var name = u.getId(),
					presence = me.ChatStore.getPresenceOf(name);


				if (presence && presence.isOnline()) {
					onlineOccupants.push(u);
				}
			});

			if (onlineOccupants.length > 1) {
				if (Ext.isEmpty(me.query('chat-log-entry'))) {
					Ext.each(me.query('chat-notification-entry'), function(el) {
						el.destroy();
					});
				}
				chatView.enable();
			}
			else if (onlineOccupants.length === 1 && !isMe(onlineOccupants[0]) && (myPresence && myPresence.isOnline())) {
				if (Ext.isEmpty(me.query('chat-log-entry'))) {
					Ext.each(me.query('chat-notification-entry'), function(el) {
						el.destroy();
					});
				}
				chatView.enable();
			}
			else if (onlineOccupants.length === 1 && isMe(onlineOccupants[0])) {
				chatView.disable();
				if (logView.addStatusNotification) {
					logView.addStatusNotification(getString('NextThought.view.chat.Window.one-occupant'));
				}
			}
			else {
				chatView.disable();
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
				me.updateDisplayState(user, getString('NextThought.view.chat.Window.unavailable'), isGroup);

				if (me.onlineOccupants.length <= 1) {
					entryView.disable();
					logView.addStatusNotification(getString('NextThought.view.chat.Window.one-occupantb'));
				}
			} else {
				if (!Ext.Array.contains(me.onlineOccupants, username)) {
					Ext.Array.push(me.onlineOccupants, username);
					entryView.enable();
					me.updateDisplayState(user, getString('NextThought.view.chat.Window.available'), isGroup);
					logView.clearChatStatusNotifications();
					logView.addStatusNotification(getFormattedString('NextThought.view.chat.Window.user-available', {name: displayName}));
				}
			}
		});
	},

	afterRender: function() {
		this.callParent(arguments);

		var me = this,
			header = me.down('nti-window-header'),
			titleEl = header && header.textEl;

		this.keyMap = new Ext.util.KeyMap({
			target: this.el,
			binding: [
				{
					key: Ext.EventObject.ESC,
					fn: this.onEsc,
					scope: this
				}
			]
		});

		if (titleEl) {
			this.mon(titleEl, 'click', me.goToProfile.bind(me));
		}
	},

	onEsc: function(k, e) {
		e.stopEvent();
		this.minimize();
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

	showSettings: function(e) {
		var target = Ext.get(e.getTarget()),
			me = this,
			isContact = this.GroupStore.isContact(this.user);

		if (!this.settingsMenu) {
			this.settingsMenu = Ext.widget('menu', {
				cls: 'chat-settings-menu',
				width: 100,
				ownerCmp: this,
				offset: [-1, -1],
				floating: true,
				defaults: {
					ui: 'nt-menuitem',
					xtype: 'menuitem',
					height: 32,
					plain: true,
					listeners: {
						scope: this,
						'click': 'addOrDropContact'
					}
				},
				items: [
					{
						text: isContact ? 'Unfollow' : 'Follow',
						checked: !isContact
					}
				]
			});
		}

		wait()
			.then(function() {
				me.settingsMenu.showBy(target.parent(), 'tr-br?', [0, 0]);
			});
	},

	addOrDropContact: function(menuItem) {
		if (!this.user) {
			return;
		}

		var me = this;
		if (this.GroupStore.isContact(this.user)) {
			this.areYouSure('The following action will remove this contact.')
				.then(function(str) {
					if (str === 'ok') {
						me.GroupActions.deleteContact(me.user)
							.then(function() {
								menuItem.update('Follow');
							});
					}
				});
		}
		else {
			this.GroupActions.addContact(this.user)
				.then(function() {
					menuItem.update('Unfollow');
				});
		}
	},

	areYouSure: function(msg) {
		/*jslint bitwise: false*/ //Tell JSLint to ignore bitwise opperations
		return new Promise(function(fulfill) {
			Ext.Msg.show({
				msg: msg,
				buttons: Ext.MessageBox.OK | Ext.MessageBox.CANCEL,
				icon: 'warning-red',
				buttonText: {'ok': 'caution:Delete'},
				title: 'Are you sure?',
				fn: fulfill
			});
		});
	},

	goToProfile: function() {
		if (this.user) {
			this.navigateToProfile(this.user);
		}
	},

	handleMessageFromChannel: function(sender, msg, room, isGroupChat) {
		var r = room || this.roomInfo;

		isGroupChat = isGroupChat || r && r.isGroupChat();
		this.logView.addMessage(msg);
		this.updateChatState(sender, 'active', r, isGroupChat);
	},

	addBulkMessages: function(messages) {
		this.logView.addBulkMessages(messages);
	},

	insertBulkMessages: function(index, messages) {
		this.logView.insertBulkMessages(index, messages);
	},

	/**
	 *	We use this method to update the state of other chat participants.
	 *	Thus, it is responsible for updating the appropriate view,
	 *	but we don't keep track of other participants' state, because they manage it themselves.
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
		}

		this.updateDisplayState(sender, Ext.Array.contains(this.activeStates, state) ? 'active' : state , isGroupChat);
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
		var me = this;
		function done(u) {
			var name = u.getName(), txt,
				displayState = me.chatUserStatesMap[state] || state;

			if (isGroupChat) {
				me.down('chat-gutter').setChatState(displayState, name);
			}
			else if (!isGroupChat && !isMe(targetUser)) {
				txt = Ext.String.ellipsis(name, 24, false);
				me.setTitle(txt);
			}
		}

		if (targetUser && targetUser.isModel) {
			done(targetUser);
		}
		else {
			UserRepository.getUser(targetUser).then(done);
		}
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
	},

	maskWindow: function() {
		this.logView.addMask();
	},

	unmaskWindow: function() {
		this.logView.removeMask();
	}
});
