Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.components.GutterEntry',
		'NextThought.app.navigation.Actions',
		'NextThought.model.User'
	],

	cls: 'chat-gutter-window',

	renderTpl: Ext.DomHelper.markup([
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']},
		{cls: 'presence-gutter-entry other-contacts', 'data-qtip': 'Other Online Contacts', cn: [
			{cls: 'profile-pic', cn: [
				{cls: 'count'},
				{cls: 'presence available'}
			]}
		]},
		{cls: 'presence-gutter-entry show-contacts', 'data-qtip': 'Show Contacts'}
	]),

	getTargetEl: function() { return this.body; },
	childEls: ['body'],

	renderSelectors: {
		contactsButtonEl: '.show-contacts',
		otherContactsEl: '.other-contacts',
		otherConctactsCountEl: '.other-contacts .count'
	},


	/* Contains all the chat rooms currently open*/
	ROOM_ENTRY_MAP: {},

	/* Contains a map of user to Entry */
	USER_ENTRY_MAP: {},

	ENTRY_BOTTOM_OFFSET: 70,

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
		this.callParent(arguments);
		this.mon(this.contactsButtonEl, 'click', this.goToContacts.bind(this));
		this.mon(this.otherContactsEl, 'click', this.goToContacts.bind(this));
		this.maybeUpdateOtherButton();
		Ext.EventManager.onWindowResize(Ext.bind(this.onResize, this));
	},

	onResize: function() {
		this.callParent(arguments);
		this.updateList(this.store, this.store.data.items);
	},

	goToContacts: function(e) {
		NextThought.app.navigation.Actions.pushRootRoute('Contacts', '/contacts/');
	},


	updateList: function(store, users) {
		this.removeAll(true);

		this.ROOM_ENTRY_MAP = {};
		this.USER_ENTRY_MAP = {};
		this.otherContacts = [];
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

	onOnlineContactRemove: function(store, records) {
		this.store.remove(records);
	},

	removeContact: function(store, user) {
		var entry = this.findEntryForUser(user.get('Username')),
			win = entry && entry.associatedWindow,
			rid = win && win.roomInfo && win.roomInfo.getId();

		// Make sure we don't remove a user with an active chat window.
		if (entry && !this.ROOM_ENTRY_MAP[rid]) {
			this.remove(entry);
			delete this.USER_ENTRY_MAP[user.get('Username')];
		}
	},


	addContacts: function(store, users) {
		var me = this;
		users.forEach(function(user) {
			var username = user.get('Username'), entry;
			if (!username || me.findEntryForUser(username)) {
				return true;
			}

			if(me.haveRoomForNewEntry()) {
				entry = me.add({
					xtype: 'chat-gutter-entry',
					user: user,
					openChatWindow: me.openChatWindow.bind(me)
				});
				me.USER_ENTRY_MAP[username] = entry;
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
			this.otherConctactsCountEl.update('+' + count);
			this.otherContactsEl.show();
		}
		else {
			this.otherContactsEl.hide();
		}
	},


	openChatWindow: function(user, entry) {
		if (entry.associatedWindow) {
			entry.associatedWindow.show();
		}
		else {
			this.ChatActions.startChat(user);
		}

		entry.clearUnreadCount();
	},


	bindChatWindow: function(win) {
		var roomInfo = win && win.roomInfo,
			isGroupChat = roomInfo.isGroupChat(),
			occupants = roomInfo && roomInfo.get('Occupants'), t, i, entry, me = this;

		if (!isGroupChat) {
			for (i = 0; i < occupants.length; i++) {
				if(!isMe(occupants[i])) {
					t = occupants[i];
					break;
				}
			}

			if (t) {
				entry = this.findEntryForUser(t);

				if (entry) {
					this.ROOM_ENTRY_MAP[roomInfo.getId()] = entry;
					entry.associatedWindow = win;
					win.onceRendered
						.then(function() {
							wait()
								.then(me.realignChatWindow.bind(me, win, entry));
						});
				}
			}
		}
	},


	realignChatWindow: function(win, entry) {
		if (!win || !entry) { return; }

		var entryEl = entry.el,
			box = entryEl.dom && entryEl.dom.getBoundingClientRect(),
			top = box && box.top;

		if (top && top > 0) {
			win.el.setStyle('top', top + 'px');
			console.debug('align chat window to:', top);
		}
	},


	onRoomExit: function (roomId) {
		var entry = this.ROOM_ENTRY_MAP[roomId];

		if (entry) {
			entry.clearUnreadCount();
			delete entry.associatedWindow;
			delete this.ROOM_ENTRY_MAP[roomId];
		}
	},


	findEntryForUser: function(userName) {
		return this.USER_ENTRY_MAP[userName];
	},


	handleWindowNotify: function(win, msg) {
		var roomInfo = win && win.roomInfo,
			occupants = roomInfo && roomInfo.get('Occupants'),
			entry, t, i, me = this;

		entry = this.ROOM_ENTRY_MAP[roomInfo.getId()];
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
			// For now just drop the notification going to contacts grouped under 'Other Contacts'.
			// In the short term, the 'Other Contacts' should grow a popout on hover
			// that we can anchor notification for extra contacts and chats.
			if (me.store.find('Username', t) > -1 && !me.USER_ENTRY_MAP[t]) {
				console.warn('No gutter entry to handle incoming chat message: ', msg);
				return;
			}

			if (t) {
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
