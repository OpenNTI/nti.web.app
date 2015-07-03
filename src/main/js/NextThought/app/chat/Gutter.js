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
		{cls: 'show-contacts', 'data-qtip': 'Show Contacts'},
		{id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}']}
	]),

	getTargetEl: function() { return this.body; },
	childEls: ['body'],

	renderSelectors: {
		contactsButtonEl: '.show-contacts'
	},

	ROOM_ENTRY_MAP: {},

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
	},


	afterRender: function() {
		this.callParent(arguments);
		this.mon(this.contactsButtonEl, 'click', this.goToContacts.bind(this));
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
		var me = this, list = [];
		users.forEach(function(user) {
			list.push({
				xtype: 'chat-gutter-entry',
				user: user,
				openChatWindow: me.openChatWindow.bind(me)
			});
		});

		me.add(list);
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
				this.ROOM_ENTRY_MAP[roomInfo.getId()] = entry;
				entry.associatedWindow = win;
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
			u = items[i].user && items[i].user.getId();
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
			console.error('Do not have an associated entry for roomInfo: ', roomInfo);
			console.log('Cannot pass notification: ', msg);
		}
	}
});
