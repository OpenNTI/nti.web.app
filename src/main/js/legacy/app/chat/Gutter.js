const Ext = require('@nti/extjs');
const { wait } = require('@nti/lib-commons');
const { DateIcon } = require('@nti/web-calendar');
const { NewChatStore } = require('@nti/web-profiles');
const { ChatSidebar } = require('@nti/web-profiles');
const { getAppUsername, isFlag } = require('@nti/web-client');
const UserRepository = require('internal/legacy/cache/UserRepository');
const User = require('internal/legacy/model/User');
const lazy = require('internal/legacy/util/lazy-require').get(
	'ParseUtils',
	() => require('internal/legacy/util/Parsing')
);
const GroupsStateStore = require('internal/legacy/app/groups/StateStore');
const NavigationActions = require('internal/legacy/app/navigation/Actions');
const NavigationStateStore = require('internal/legacy/app/navigation/StateStore');

require('internal/legacy/overrides/ReactHarness');

const ChatStateStore = require('./StateStore');
const ChatActions = require('./Actions');

require('./components/gutter/GutterEntry');
require('./components/gutter/List');

let options = {
	items: [],
	layout: 'none',
};

const newChat = isFlag('new-chat');

if (!newChat) {
	options = {
		cls: 'chat-gutter-window',

		renderTpl: Ext.DomHelper.markup([
			{
				cls: 'presence-gutter-entry show-calendar',
				'data-qtip': 'Show Calendar',
			},
			{ id: '{id}-body', cn: ['{%this.renderContainer(out, values)%}'] },
			{
				cls: 'presence-gutter-entry other-contacts',
				'data-qtip': 'Expand Contacts',
				'data-badge': '0',
				cn: [{ cls: 'profile-pic' }],
			},
			{
				cls: 'presence-gutter-entry show-contacts',
				'data-qtip': 'Show Contacts',
			},
		]),

		getTargetEl: function () {
			return this.body;
		},
		childEls: ['body'],

		renderSelectors: {
			contactsButtonEl: '.show-contacts',
			otherContactsEl: '.other-contacts',
			showCalendarEl: '.show-calendar',
		},
	};
}

module.exports = exports = Ext.define('NextThought.app.chat.Gutter', {
	extend: 'Ext.container.Container',
	alias: 'widget.chat-gutter-window',

	...options,

	ENTRY_BOTTOM_OFFSET: 100,

	initComponent: function () {
		this.callParent(arguments);

		this.GroupStore = GroupsStateStore.getInstance();
		this.ChatStore = ChatStateStore.getInstance();
		this.ChatActions = ChatActions.create();
		this.NavigationStore = NavigationStateStore.getInstance();

		this.buildStore();
		this.mon(this.ChatStore, {
			notify: this.handleWindowNotify.bind(this),
			'added-chat-window': this.bindChatWindow.bind(this),
			'exited-room': this.onRoomExit.bind(this),
			'presence-changed': this.updatePresence.bind(this),
			'gutter-active': this.updateList.bind(
				this,
				this.store,
				this.store.data.items
			),
		});
		this.otherContacts = [];
		this.collapsedMessageCount = 0;

		if (newChat) {
			this.newGutter = this.add({
				xtype: 'react',
				component: ChatSidebar,
				addHistory: true,
				baseroute: '/app',
				navigation: false,
			});
		}
	},

	buildStore: function () {
		var onlineContactStore = this.GroupStore.getOnlineContactStore(),
			store;

		// NOTE: The gutter needs to listen to online Contacts store but also handle chats from non-contacts.
		// As a result, it can't just be an online contacts store, because it has to contains active chats as well.
		// And some of those users in active chats might not pass the online contacts store filters,
		// namely the fact that they have to be in your contacts
		store = new Ext.data.Store({
			proxy: 'memory',
			model: User,
			data: onlineContactStore.getRange(),
		});

		this.mon(onlineContactStore, {
			load: this.onOnlineContactAdd.bind(this),
			add: this.onOnlineContactAdd.bind(this),
			remove: this.onOnlineContactRemove.bind(this),
		});

		this.store = store;

		this.mon(this.store, {
			load: this.updateList.bind(this),
			add: this.addContacts.bind(this),
			remove: this.removeContact.bind(this),
		});
	},

	afterRender: function () {
		var me = this;
		this.callParent(arguments);
		if (!newChat) {
			this.mon(
				this.contactsButtonEl,
				'click',
				this.goToContacts.bind(this)
			);
			this.mon(
				this.otherContactsEl,
				'click',
				this.showAllOnlineContacts.bind(this)
			);
			this.mon(
				this.showCalendarEl,
				'click',
				this.showCalendar.bind(this)
			);
			this.maybeUpdateOtherButton();
			Ext.EventManager.onWindowResize(Ext.bind(this.onResize, this));

			if (Service.getCollection('Calendars')) {
				this.dateIcon = Ext.widget('react', {
					renderTo: this.showCalendarEl,
					component: DateIcon,
				});
			} else {
				this.showCalendarEl.hide();
			}
		}

		this.on('show', function () {
			me.updateList(me.store, me.store.data.items);
		});
		this.syncWithRecentChats();
	},

	onDestroy: function () {
		this.callParent(arguments);

		if (this.dateIcon) {
			this.dateIcon.destroy();
			delete this.dateIcon;
		}
	},

	syncWithRecentChats: function () {
		// This function makes sure that we're in sync with the Chat Statestore.
		// It helps recover and add gutter entries for people
		// whom we might not be following but recently chatted with.
		var me = this,
			occupantsKeys = this.ChatStore.getAllOccupantsKeyAccepted() || [];

		occupantsKeys.forEach(function (occupantsKey) {
			var isNTIID = lazy.ParseUtils.isNTIID(occupantsKey),
				users = isNTIID === false ? occupantsKey.split('_') : [],
				o = Ext.Array.remove(users.slice(), $AppConfig.username);

			if (
				o.length === 1 &&
				me.store.find('Username', o[0], 0, false, false, true) === -1
			) {
				// This is 1-1 chat, not a groupchat
				UserRepository.getUser(o[0]).then(function (u) {
					// var p = u.getPresence();
					me.store.add(u);
				});
			}
		});
	},

	onResize: function () {
		if (!this.isVisible()) {
			return;
		}

		this.callParent(arguments);
		this.updateList(this.store, this.store.data.items);
	},

	goToContacts: function (e) {
		NavigationActions.pushRootRoute('Contacts', '/contacts/');
	},

	showCalendar: function (e) {
		// this.dateIcon.setProps({viewed: true});

		this.ChatStore.fireEvent('show-calendar-window', this);
	},

	showAllOnlineContacts: function (e) {
		this.clearCollapsedMessageCount();
		this.ChatStore.fireEvent('show-all-gutter-contacts', this);
		this.maybeAdjustChatWindow();
	},

	updateList: function (store, users) {
		if (!newChat) {
			this.removeAll(true);
			this.otherContacts = [];
			this.collapsedMessageCount = 0;
		}
		this.addContacts(store, users);
	},

	updatePresence: function (username, presence) {
		if (!newChat) {
			var user = this.findEntryForUser(username),
				nodeIndex;

			if (user) {
				user.setStatus(presence);
			}
			if (this.gutterList && this.gutterList.isVisible()) {
				nodeIndex = this.store.find(
					'Username',
					username,
					0,
					false,
					false,
					true
				);
				if (nodeIndex > -1) {
					this.gutterList.refreshNode(nodeIndex);
				}
			}
		} else {
			if (username === getAppUsername()) {
				return;
			}
			NewChatStore.updatePresence(username, presence.getName());
		}
	},

	onOnlineContactAdd: function (store, records) {
		this.store.add(records);
	},

	onOnlineContactRemove: function (store, record) {
		// Make sure we don't remove a user with an active chat window.
		var r = this.store.findRecord(
			'Username',
			record.get('Username'),
			0,
			false,
			false,
			true
		);
		if (r && !this.hasActiveChat(r.get('Username'))) {
			this.store.remove(r);
		}
	},

	hasActiveChat: function (username) {
		var occupantsKeys = this.ChatStore.getAllOccupantsKeyAccepted() || [],
			isActiveChat = false;

		occupantsKeys.forEach(function (occupantsKey) {
			var isNTIID = lazy.ParseUtils.isNTIID(occupantsKey),
				users = isNTIID === false ? occupantsKey.split('_') : [],
				o = Ext.Array.remove(users.slice(), $AppConfig.username);

			if (username === o[0]) {
				isActiveChat = true;
			}
		});

		return isActiveChat;
	},

	removeContact: function (store, user) {
		var entry = this.findEntryForUser(user);

		if (entry) {
			this.remove(entry);
			newChat && NewChatStore.removeContact(user.get('Username'));
		}
	},

	addContacts: async function (store, users) {
		if (!newChat) {
			var me = this;
			users.forEach(function (user) {
				var username = user.get('Username');
				if (!username || me.findEntryForUser(username)) {
					return true;
				}

				if (me.haveRoomForNewEntry()) {
					me.add({
						xtype: 'chat-gutter-entry',
						user: user,
						openChatWindow: me.openChatWindow.bind(me),
					});
				} else {
					me.otherContacts.push(user);
				}
			});

			me.maybeUpdateOtherButton();
		} else {
			const contacts = await Promise.all(
				users.map(user => user.getInterfaceInstance())
			);
			NewChatStore.addContacts(contacts);
		}
	},

	haveRoomForNewEntry: function (u) {
		var gutterHeight = this.getHeight(),
			gutterEntryHeight = 60,
			maxEntryNumber = Math.floor(
				(gutterHeight - this.ENTRY_BOTTOM_OFFSET) / gutterEntryHeight
			),
			currentCount = this.query('chat-gutter-entry').length;

		return maxEntryNumber > 0 ? currentCount < maxEntryNumber : true;
	},

	maybeUpdateOtherButton: function () {
		var count = this.otherContacts.length;
		if (count > 0) {
			this.otherContactsEl.show();
		}
		// else {
		//	this.otherContactsEl.hide();
		// }
	},

	openChatWindow: function (user, entry) {
		if (this.onChatOpen) {
			this.onChatOpen();
		}

		var isVisible =
			user.associatedWindow && user.associatedWindow.isVisible();
		if (user.associatedWindow && !user.associatedWindow.isDestroyed) {
			user.associatedWindow[isVisible ? 'hide' : 'show']();
		} else {
			this.selectActiveUser(user);
			this.ChatActions.startChat(user);
		}
		this.clearUnreadCount(user);
		this.NavigationStore.fireEvent('clear-chat-tab', user);
	},

	selectActiveUser: function (user) {
		var d = this.getAnchorPointForUser(user),
			entry = Ext.get(d);

		if (this.activeUser) {
			this.deselectActiveUser(this.activeUser);
			newChat && NewChatStore.deselectUser();
		}

		if (entry) {
			entry.addCls('active');
			this.activeUser = user;
			newChat && NewChatStore.selectUser(user.get('Username'));
		}
	},

	deselectActiveUser: function (user) {
		var d = this.getAnchorPointForUser(user),
			entry = d && Ext.get(d);

		if (entry && entry.hasCls('active')) {
			entry.removeCls('active');
			this.activeUser = null;
			newChat && NewChatStore.deselectUser();
		}
	},

	clearUnreadCount: function (user) {
		var entry = this.findEntryForUser(user);

		user.set('unreadMessageCount', 0);
		if (entry) {
			entry.clearUnreadCount();
		}
	},

	bindChatWindow: function (win) {
		var roomInfo = win && win.roomInfo,
			isGroupChat = roomInfo.isGroupChat(),
			occupants = roomInfo && roomInfo.get('Occupants'),
			me = this,
			user,
			username;

		occupants = Ext.Array.remove(
			occupants.slice(),
			$AppConfig.userObject.get('Username')
		);
		username = occupants[0];
		if (!isGroupChat && username) {
			// const entry = this.findEntryForUser(username);

			// We want an exact match.
			user = this.store.findRecord(
				'Username',
				username,
				0,
				false,
				false,
				true
			);
			if (user) {
				user.associatedWindow = win;
				win.on({
					show: function () {
						wait().then(function () {
							me.adjustToExpandedChat(win);
							me.selectActiveUser(user);
						});
					},
					hide: function () {
						wait().then(me.deselectActiveUser.bind(me, user));
					},
				});
			}
		}
	},

	updateCollapsedMessageCount: function (count) {
		var t = this.otherContactsEl.dom;
		t.setAttribute('data-badge', count);
	},

	incrementCollapsedMesssageCount: function () {
		this.collapsedMessageCount += 1;
		this.updateCollapsedMessageCount(this.collapsedMessageCount);
	},

	clearCollapsedMessageCount: function () {
		this.collapsedMessageCount = 0;
		this.updateCollapsedMessageCount(0);
	},

	getAnchorPointForUser: function (user) {
		var dom, entry;
		if (this.gutterList && this.gutterList.isVisible()) {
			dom = this.gutterList.getNode(user);
		} else {
			entry = this.findEntryForUser(user);
			dom = entry && entry.el && entry.el.dom;
		}

		return dom;
	},

	adjustToExpandedChat: function (win) {
		if (!win) {
			return;
		}

		if (
			this.gutterList &&
			this.gutterList.el &&
			this.gutterList.el.isVisible()
		) {
			win.addCls('gutter-list-open');
			this.gutterList.on({
				hide: function () {
					win.removeCls('gutter-list-open');
				},
			});
		} else {
			win.removeCls('gutter-list-open');
		}
	},

	maybeAdjustChatWindow: function () {
		var wins = this.ChatStore.getAllChatWindows(),
			me = this;

		Ext.each(wins || [], function (win) {
			if (win && win.isVisible()) {
				me.adjustToExpandedChat(win);
			}
		});
	},

	onRoomExit: function (roomId) {
		var user,
			entry,
			me = this;

		Service.getObject(roomId).then(function (roomInfo) {
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

	findEntryForUser: function (user) {
		var userName = user && user.isModel ? user.get('Username') : user,
			result;

		Ext.each(this.items.items, function (entry) {
			if (entry.user && entry.user.get('Username') === userName) {
				result = entry;
				return false;
			}
		});

		return result;
	},

	handleWindowNotify: function (win, msg) {
		if (win && win.isVisible()) {
			return;
		}

		var entry,
			me = this,
			currentCount,
			userRec,
			sender = msg.isModel ? msg.get('Creator') : msg.Creator;

		entry = this.findEntryForUser(sender);
		newChat && NewChatStore.handleWindowNotify(sender);
		if (entry) {
			entry.handleWindowNotify(win, msg);
		} else {
			// If we have a user in our store but don't have an entry for them,
			// it means they are already in the 'other contacts'.
			// Go ahead and increment the message count of 'Other Contacts'.
			// On click, we show the full gutter list with the right count.
			if (me.store.find('Username', sender, 0, false, false, true) > -1) {
				if (me.isVisible()) {
					me.incrementCollapsedMesssageCount();
				}

				userRec = this.store.findRecord(
					'Username',
					sender,
					0,
					false,
					false,
					true
				);
				if (userRec) {
					currentCount = userRec.get('unreadMessageCount') || 0;
					currentCount += 1;
					userRec.set('unreadMessageCount', currentCount);
				}
			} else {
				UserRepository.getUser(sender).then(function (u) {
					me.store.add(u);
					me.bindChatWindow(win);
					wait().then(me.handleWindowNotify.bind(me, win, msg));
				});
			}
		}
	},
});
