Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.components.GutterEntry',
		'NextThought.app.navigation.Actions'
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

	ENTRY_BOTTOM_OFFSET: 120,

	initComponent: function() {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();
		this.store = this.GroupStore.getOnlineContactStore();
		this.ChatActions = NextThought.app.chat.Actions.create();

		this.mon(this.store, {
			'load': this.updateList.bind(this),
			'add': this.addContacts.bind(this),
			'remove': this.removeContact.bind(this)
		});

		this.mon(this.ChatStore, {
			'notify': this.handleWindowNotify.bind(this),
			'added-chat-window': this.bindChatWindow.bind(this),
			'exited-room': this.onRoomExit.bind(this),
			'presence-changed': this.updatePresence.bind(this)
		});
		this.otherContacts = [];
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.contactsButtonEl, 'click', this.goToContacts.bind(this));
		this.mon(this.otherContactsEl, 'click', this.goToContacts.bind(this));
		this.maybeUpdateOtherButton();
		Ext.EventManager.onWindowResize(Ext.bind(this.onResize, this));
	},

	onResize: function(){
		this.callParent(arguments);
		this.updateList(this.store, this.store.data.items);
	},

	goToContacts: function(e) {
		NextThought.app.navigation.Actions.pushRootRoute('Contacts', '/contacts/');
	},


	updateList: function(store, users) {
		this.removeAll(true);
		this.otherContacts = [];
		this.addContacts(store, users);
	},


	updatePresence: function(username, presence) {
		var user = this.findEntryForUser(username);

		if(user) {
			user.setStatus(presence);
		}
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
			if (me.findEntryForUser(username)) {
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

			if (t) {
				UserRepository.getUser(t)
					.then(function (u) {
						me.addContacts(null, [u]);
						me.bindChatWindow(win);
						wait()
							.then(me.handleWindowNotify.bind(me, win, msg));
					});
			}
		}
	}
});
