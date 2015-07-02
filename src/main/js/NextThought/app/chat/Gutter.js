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
			'notify': this.handleWindowNotify.bind(this)
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
		var list = [];

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


	openChatWindow: function(user, e) {
		this.ChatActions.startChat(user);
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
			isGroupChat = roomInfo && roomInfo.isGroupChat(),
			targetUser, i, occupants = roomInfo &&roomInfo.getOriginalOccupants(), entry;

		// TODO: Clean this up later. We should probably use some kind of map.
		if (!isGroupChat) {
			for (i = 0; i < occupants.length; i++) {
				if(!isMe(occupants[i])) {
					targetUser = occupants[i];
					break;
				}
			}

			if (targetUser) {
				entry = this.findEntryForUser(targetUser);
			}

			if (entry) {
				entry.handleWindowNotify(win, msg);
			}
		}

	}
});
