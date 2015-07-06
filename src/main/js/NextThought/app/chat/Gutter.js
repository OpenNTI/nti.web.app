Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	requires: [
		'NextThought.app.groups.StateStore',
		'NextThought.app.chat.StateStore',
		'NextThought.app.chat.Actions',
		'NextThought.app.chat.components.GutterEntry'
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

	ROOM_ENTRY_MAP: {},

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
			'exited-room': this.onRoomExit.bind(this)
		});
		this.otherContacts = [];
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.contactsButtonEl, 'click', this.goToContacts.bind(this));
		this.mon(this.otherContactsEl, 'click', this.goToContacts.bind(this));
		this.maybeUpdateOtherButton();
	},


	goToContacts: function(e) {
		console.warn('Should Navigate to contacts');
	},


	updateList: function(store, users) {
		this.removeAll(true);
		this.addContacts(store, users);
	},


	removeContact: function(store, user) {
		var entry = this.findEntryForUser(user.getId());
		if (entry) {
			this.remove(entry);
		}
	},


	addContacts: function(store, users) {
		var me = this;
		users.forEach(function(user) {
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
			this.otherConctactsCountEl.update('+' + count);
			this.otherContactsEl.show();
		}
		else {
			this.otherContactsEl.hide();
		}
	},


	openChatWindow: function(user, entry, e) {
		if (entry.associatedWindow) {
			entry.associatedWindow.show();
		}
		else {
			this.ChatActions.startChat(user);
		}
	},


	bindChatWindow: function(win) {
		var roomInfo = win && win.roomInfo,
			isGroupChat = roomInfo.isGroupChat(),
			occupants = roomInfo && roomInfo.getOriginalOccupants(), t, i, entry;

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
				}
			}
		}
	},


	onRoomExit: function (roomId) {
		var entry = this.ROOM_ENTRY_MAP[roomId];

		if (entry) {
			delete entry.associatedWindow;
			delete this.ROOM_ENTRY_MAP[roomId];
		}
	},


	findEntryForUser: function(userName) {
		var items = this.items.items, entry, u, i;

		for (i = 0; i < items.length && !entry; i++) {
			u = items[i].user && items[i].user.get('Username');
			if (u === userName) {
				entry = items[i];
			}
		}

		return entry;
	},


	handleWindowNotify: function(win, msg) {
		var roomInfo = win && win.roomInfo,
			entry;

		entry = this.ROOM_ENTRY_MAP[roomInfo.getId()];
		if (entry) {
			entry.handleWindowNotify(win, msg);
		}
		else {
			this.ChatStore.fireEvent('chat-notification-toast', win, msg);
		}
	}
});
