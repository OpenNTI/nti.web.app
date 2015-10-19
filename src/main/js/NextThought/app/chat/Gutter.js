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

	ENTRY_BOTTOM_OFFSET: 100,

	initComponent: function() {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.ChatActions = NextThought.app.chat.Actions.create();
		this.NavigationStore = NextThought.app.navigation.StateStore.getInstance();

		this.buildStore();
		this.mon(this.ChatStore, {
			'notify': this.handleWindowNotify.bind(this),
			'added-chat-window': this.bindChatWindow.bind(this),
			'exited-room': this.onRoomExit.bind(this),
			'presence-changed': this.updatePresence.bind(this),
			'gutter-active': this.updateList.bind(this, this.store, this.store.data.items)
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
		this.syncWithRecentChats();
	},

	syncWithRecentChats: function() {
		// This function makes sure that we're in sync with the Chat Statestore.
		// It helps recover and add gutter entries for people 
		// whom we might not be following but recently chatted with.
		var me = this,
			occupantsKeys = this.ChatStore.getAllOccupantsKeyAccepted() || [];

		occupantsKeys.forEach(function(occupantsKey) {
			var isNTIID = ParseUtils.isNTIID(occupantsKey),
				users = isNTIID === false ? occupantsKey.split('_') : [],
				o = Ext.Array.remove(users.slice(), $AppConfig.username);

			if (o.length === 1 && me.store.find('Username', o[0], 0, false, false, true) === -1) {
				// This is 1-1 chat, not a groupchat
				UserRepository.getUser(o[0])
					.then(function (u) {
						// var p = u.getPresence();
						me.store.add(u);
					});
			}
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
		this.otherContacts = [];
		this.collapsedMessageCount = 0;
		this.addContacts(store, users);
	},


	updatePresence: function(username, presence) {
		var user = this.findEntryForUser(username),
			nodeIndex;

		if(user) {
			user.setStatus(presence);
		}
		if (this.gutterList && this.gutterList.isVisible()) {
			nodeIndex = this.store.find('Username', username, 0, false, false, true);
			if (nodeIndex > -1) {
				this.gutterList.refreshNode(nodeIndex);
			}
		}
	},

	onOnlineContactAdd: function(store, records) {
		this.store.add(records);
	},

	onOnlineContactRemove: function(store, record) {
		// Make sure we don't remove a user with an active chat window.
		var r = this.store.findRecord('Username', record.get('Username'), 0, false, false, true);
		if (r && !this.hasActiveChat(r.get('Username'))) {
			this.store.remove(r);
		}
	},


	hasActiveChat: function(username) {
		var occupantsKeys = this.ChatStore.getAllOccupantsKeyAccepted() || [],
			isActiveChat = false;

		occupantsKeys.forEach(function(occupantsKey) {
			var isNTIID = ParseUtils.isNTIID(occupantsKey),
				users = isNTIID === false ? occupantsKey.split('_') : [],
				o = Ext.Array.remove(users.slice(), $AppConfig.username);

			if (username === o[0]) {
				isActiveChat = true;
			}
		});

		return isActiveChat;
	},


	removeContact: function(store, user) {
		var entry = this.findEntryForUser(user);

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

		return maxEntryNumber > 0 ? currentCount < maxEntryNumber : true;
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
		var isVisible = user.associatedWindow && user.associatedWindow.isVisible();
		if (user.associatedWindow && !user.associatedWindow.isDestroyed) {
			user.associatedWindow[isVisible ? 'hide' : 'show']();
		}
		else {
			this.selectActiveUser(user);
			this.ChatActions.startChat(user);
		}
		this.clearUnreadCount(user);
		this.NavigationStore.fireEvent('clear-chat-tab', user);
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
			occupants = roomInfo && roomInfo.get('Occupants'),
			me = this, user, username;

		occupants = Ext.Array.remove(occupants.slice(), $AppConfig.userObject.get('Username'));
		username = occupants[0];
		if (!isGroupChat && username) {
			entry = this.findEntryForUser(username);

			// We want an exact match.
			user = this.store.findRecord('Username', username, 0, false, false, true);
			if (user) {
				user.associatedWindow = win;
				win.on({
					show: function() {
							wait()
								.then(function() {
									me.adjustToExpandedChat(win);
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


	adjustToExpandedChat: function(win) {
		if(!win) { return; }

		if (this.gutterList && this.gutterList.el && this.gutterList.el.isVisible()) {
			win.addCls('gutter-list-open');
			this.gutterList.on({
				hide: function() {
					win.removeCls('gutter-list-open');
				}
			});
		}
		else {
			win.removeCls('gutter-list-open');
		}
	},


	maybeAdjustChatWindow: function() {
		var wins = this.ChatStore.getAllChatWindows(),
			me = this;

		Ext.each(wins || [], function(win) {
			if (win && win.isVisible()) {
				me.adjustToExpandedChat(win);
			}
		});
	},


	onRoomExit: function (roomId) {
		var user, entry, me = this;

		Service.getObject(roomId)
			.then(function(roomInfo) {
				var o = roomInfo.get('Occupants');

				user = Ext.Array.remove(o.slice(), $AppConfig.username)[o];
				entry = me.findEntryForUser(user);
				user = me.store.findRecord('Username', user, 0, false, false, true);
				if (entry) {
					entry.clearUnreadCount();
				}

				delete user.associatedWindow;
				if (me.gutterList && me.gutterList.onRoomExit) {
					me.gutterList.onRoomExit(roomInfo);
				}
			});
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

		var entry, me = this, currentCount, userRec,
			sender = msg.isModel ? msg.get('Creator') : msg.Creator;

		entry = this.findEntryForUser(sender);
		if (entry) {
			entry.handleWindowNotify(win, msg);
		}
		else {
			// If we have a user in our store but don't have an entry for them,
			// it means they are already in the 'other contacts'.
			// Go ahead and increment the message count of 'Other Contacts'.
			// On click, we show the full gutter list with the right count.
			if (me.store.find('Username', sender, 0, false, false, true) > -1) {
				if (me.isVisible()) {
					me.incrementCollapsedMesssageCount();
				}

				userRec = this.store.findRecord('Username', sender, 0, false, false, true);
				if (userRec) {
					currentCount = userRec.get('unreadMessageCount') || 0;
					currentCount += 1;
					userRec.set('unreadMessageCount', currentCount);
				}
			}
			else {
				UserRepository.getUser(sender)
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
