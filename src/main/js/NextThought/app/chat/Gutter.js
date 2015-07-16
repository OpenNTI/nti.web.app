Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.components.gutter.GutterEntry',
		'NextThought.app.chat.components.gutter.List',
		'NextThought.app.navigation.Actions',
		'NextThought.model.User'
	],

	cls: 'chat-gutter-window',

	renderTpl: Ext.DomHelper.markup([
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']},
		{cls: 'presence-gutter-entry other-contacts', 'data-qtip': 'Expand Contacts', 'data-badge': '0', cn: [
			{cls: 'profile-pic'}
		]},
		{cls: 'presence-gutter-entry show-contacts', 'data-qtip': 'Show Contacts'}
	]),

	getTargetEl: function() { return this.body; },
	childEls: ['body'],

	renderSelectors: {
		contactsButtonEl: '.show-contacts',
		otherContactsEl: '.other-contacts'
	},


	/* Contains all the chat rooms currently open*/
	ROOM_USER_MAP: {},

	ENTRY_BOTTOM_OFFSET: 100,

	initComponent: function() {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();

		this.buildStore();
		this.mon(this.ChatStore, {
			'notify': this.handleWindowNotify.bind(this),
			'added-chat-window': this.bindChatWindow.bind(this),
			'exited-room': this.onRoomExit.bind(this),
			'presence-changed': this.updatePresence.bind(this)
		});
		this.otherContacts = [];
		this.collapsedMessageCount = 0;
	},


	buildStore: function() {
		var onlineContactStore = this.GroupStore.getOnlineContactStore(),
			store;

		// NOTE: The gutter needs to listen to online Contacts store but also handle chats from non-contacts.
		// As a result, it can't just be an online contacts store, because it has to contains active chats as well.
		// And some of those users in active chats might not pass the online contacts store filters, 
		// namely the fact that they have to be in your contacts
		store = new Ext.data.Store({
			proxy: 'memory',
			model: NextThought.model.User,
			data: onlineContactStore.getRange()
		});

		this.mon(onlineContactStore, {
			'load': this.onOnlineContactAdd.bind(this),
			'add': this.onOnlineContactAdd.bind(this),
			'remove': this.onOnlineContactRemove.bind(this)
		});

		this.store = store;

		this.mon(this.store, {
			'load': this.updateList.bind(this),
			'add': this.addContacts.bind(this),
			'remove': this.removeContact.bind(this)
		});
	},


	afterRender: function() {
		var me = this;
		this.callParent(arguments);
		this.mon(this.contactsButtonEl, 'click', this.goToContacts.bind(this));
		this.mon(this.otherContactsEl, 'click', this.showAllOnlineContacts.bind(this));
		this.maybeUpdateOtherButton();
		Ext.EventManager.onWindowResize(Ext.bind(this.onResize, this));

		this.on('show', function() {
			me.updateList(me.store, me.store.data.items);
		});
	},

	onResize: function() {
		if (!this.isVisible()) { return; }

		this.callParent(arguments);
		this.updateList(this.store, this.store.data.items);
	},

	goToContacts: function(e) {
		NextThought.app.navigation.Actions.pushRootRoute('Contacts', '/contacts/');
	},


	showAllOnlineContacts: function(e) {
		this.clearCollapsedMessageCount();
		this.ChatStore.fireEvent('show-all-gutter-contacts', this);
		this.maybeAdjustChatWindow();
	},


	updateList: function(store, users) {
		this.removeAll(true);

		this.ROOM_USER_MAP = {};
		this.otherContacts = [];
		this.collapsedMessageCount = 0
		this.addContacts(store, users);
	},


	updatePresence: function(username, presence) {
		var user = this.findEntryForUser(username);

		if(user) {
			user.setStatus(presence);
		}
	},

	onOnlineContactAdd: function(store, records) {
		this.store.add(records);
	},

	onOnlineContactRemove: function(store, record) {
		if (!record.associatedWindow) {
			this.store.remove(record);
		}
	},

	removeContact: function(store, user) {
		var entry = this.findEntryForUser(user);

		// Make sure we don't remove a user with an active chat window.
		if (entry) {
			this.remove(entry);
		}
	},


	addContacts: function(store, users) {
		var me = this;
		users.forEach(function(user) {
			var username = user.get('Username');
			if (!username || me.findEntryForUser(username)) {
				return true;
			}

			if(me.haveRoomForNewEntry()) {
				me.add({
					xtype: 'chat-gutter-entry',
					user: user,
					openChatWindow: me.openChatWindow.bind(me)
				});
			}
			else {
				me.otherContacts.push(user);
			}
		});

		me.maybeUpdateOtherButton();
	},


	haveRoomForNewEntry: function(u) {
		var gutterHeight = this.getHeight(),
			gutterEntryHeight = 60,
			maxEntryNumber = Math.floor((gutterHeight - this.ENTRY_BOTTOM_OFFSET) / gutterEntryHeight),
			currentCount = this.query('chat-gutter-entry').length;

		return currentCount < maxEntryNumber;
	},


	maybeUpdateOtherButton: function() {
		var count = this.otherContacts.length;
		if (count > 0) {
			this.otherContactsEl.show();
		}
		// else {
		// 	this.otherContactsEl.hide();
		// }
	},


	openChatWindow: function(user, entry) {
		if (entry && entry.hasCls('active')) {
			//Minimize the window.
			if (user.associatedWindow) {
				user.associatedWindow.hide();
			}	
			return;
		}

		if (user.associatedWindow) {
			user.associatedWindow.show();
		}
		else {
			this.ChatActions.startChat(user);
			this.selectActiveUser(user);
		}
		this.clearUnreadCount(user);
	},


	selectActiveUser: function(user) {
		var d = this.getAnchorPointForUser(user),
			entry = Ext.get(d);

		if (this.activeUser) {
			this.deselectActiveUser(this.activeUser);
		}

		if (entry) {
			entry.addCls('active');
			this.activeUser = user;
		}
	},


	deselectActiveUser: function(user) {
		var d = this.getAnchorPointForUser(user),
			entry = d && Ext.get(d);

		
		if (entry && entry.hasCls('active')) {
			entry.removeCls('active');
			this.activeUser = null;
		}
	},


	clearUnreadCount: function(user) {
		var entry = this.findEntryForUser(user);

		user.set('unreadMessageCount', 0);
		if(entry) {
			entry.clearUnreadCount();
		}
	},


	bindChatWindow: function(win) {
		var roomInfo = win && win.roomInfo,
			isGroupChat = roomInfo.isGroupChat(),
			occupants = roomInfo && roomInfo.get('Occupants'), t, i, entry, me = this, user;


		if (!isGroupChat) {
			for (i = 0; i < occupants.length; i++) {
				if(!isMe(occupants[i])) {
					t = occupants[i];
					break;
				}
			}

			if (t) {
				entry = this.findEntryForUser(t);
				user = this.store.findRecord('Username', t);

				if (user) {
					this.ROOM_USER_MAP[roomInfo.getId()] = user;
					user.associatedWindow = win;
					win.on({
						show: function() {
								wait()
									.then(function() {
										me.realignChatWindow(win, user);
										me.selectActiveUser(user);
									});
							},
						hide: function() {
							wait()
								.then(me.deselectActiveUser.bind(me, user));
						}
					});
				}
			}
		}
	},


	updateCollapsedMessageCount: function(count) {
		var t = this.otherContactsEl.dom;
		t.setAttribute('data-badge', count);
	},


	incrementCollapsedMesssageCount: function() {
		this.collapsedMessageCount += 1;
		this.updateCollapsedMessageCount(this.collapsedMessageCount);
	},


	clearCollapsedMessageCount: function() {
		this.collapsedMessageCount = 0;
		this.updateCollapsedMessageCount(0);
	},


	getAnchorPointForUser: function(user) {
		var dom, entry;
		if (this.gutterList && this.gutterList.isVisible()) {
			dom = this.gutterList.getNode(user);
		}
		else {
			entry = this.findEntryForUser(user);
			dom = entry && entry.el && entry.el.dom;
		}

		return dom;
	},


	realignChatWindow: function(win, user) {
		if (!win) { return; }
		this.adjustToExpandedChat(win);
	},


	adjustToExpandedChat: function(win) {
		if(!win) { return; }

		if (this.gutterList && this.gutterList.isVisible()) {
			win.addCls('gutter-list-open');
			this.gutterList.on({
				hide: function() {
					win.removeCls('gutter-list-open');
				}
			});
		}
	},


	maybeAdjustChatWindow: function() {
		var wins = this.ChatStore.getAllChatWindows(),
			me = this, rid;

		Ext.each(wins || [], function(win) {
			if (win && win.isVisible()) {
				me.adjustToExpandedChat(win);
			}

			rid = win && win.roomInfo && win.roomInfo.getId();
			if (me.ROOM_USER_MAP[rid]) {
				me.realignChatWindow(win, me.ROOM_USER_MAP[rid]);
			}
		});
	},


	onRoomExit: function (roomId) {
		var user = this.ROOM_USER_MAP[roomId],
			entry = this.findEntryForUser(user && user.get('Username'));

		if (entry) {
			entry.clearUnreadCount();
		}

		if (user) {
			delete user.associatedWindow;
			delete this.ROOM_USER_MAP[roomId];
		}

		if (this.gutterList && this.gutterList.onRoomExit) {
			this.gutterList.onRoomExit(roomId);
		}
	},


	findEntryForUser: function(user) {
		var userName = user && user.isModel ? user.get('Username') : user,
			result;

		Ext.each(this.items.items, function(entry) {
			if (entry.user && (entry.user.get('Username') === userName)) {
				result = entry;
				return false;
			}
		});

		return result;
	},


	handleWindowNotify: function(win, msg) {
		if(win && win.isVisible()) { return; }

		var roomInfo = win && win.roomInfo,
			occupants = roomInfo && roomInfo.get('Occupants'),
			entry, t, i, me = this, user, currentCount;

		user = this.ROOM_USER_MAP[roomInfo.getId()];
		entry = this.findEntryForUser(user);
		if (entry) {
			entry.handleWindowNotify(win, msg);
		}
		else {
			if (!roomInfo.isGroupChat()) {
				for (i = 0; i < occupants.length; i++) {
					if(!isMe(occupants[i])) {
						t = occupants[i];
						break;
					}
				}
			}

			// If we have a user in our store but don't have an entry for them,
			// it means they are already in the 'other contacts'.
			// Go ahead and increment the message count of 'Other Contacts'.
			// On click, we show the full gutter list with the right count.
			if (me.store.find('Username', t) > -1 && !me.findEntryForUser(t)) {
				me.incrementCollapsedMesssageCount();
				user = this.store.findRecord('Username', t);
				if (user) {
					currentCount = user.get('unreadMessageCount') || 0;
					currentCount += 1;
					user.set('unreadMessageCount', currentCount);
				}
				return;
			}

			if (t && me.store.find('Username', t) === -1) {
				UserRepository.getUser(t)
					.then(function (u) {
						me.store.add(u);
						me.bindChatWindow(win);
						wait()
							.then(me.handleWindowNotify.bind(me, win, msg));
					});
			}
		}
	}
});
