const Ext = require('@nti/extjs');
const {getService} = require('@nti/web-client');

const FriendsListStore = require('legacy/store/FriendsList');
const ContactsStore = require('legacy/store/Contacts');

require('legacy/common/StateStore');
require('../chat/StateStore');

function syncFriendsList (ext, lib) {
	ext.set('friends', lib.friends.map(friend => friend.getID()));
	ext.fireEvent('changed', ext);
}


module.exports = exports = Ext.define('NextThought.app.groups.StateStore', {
	extend: 'NextThought.common.StateStore',
	MY_CONTACTS_PREFIX_PATTERN: 'mycontacts-{0}',


	syncContacts () {
		const store = this.getFriendsList();

		getService()
			.then(service => service.getContacts())
			.then((contacts) => {
				contacts.addListener('change', () => {
					syncFriendsList(this.getContactGroup(), contacts.getContactsList());

					const lists = contacts.getLists();

					for (let list of lists) {
						const group = store.getById(list.getID());

						if (group) {
							syncFriendsList(group, list);
						}
					}
				});
			});
	},


	getFriendsList: function () {
		if (!this['friends_list_store']) {
			this['friends_list_store'] = FriendsListStore.create();
		}

		return this['friends_list_store'];
	},

	getGroupsList: function () {
		if (!this['groups_store']) {
			this['groups_store'] = FriendsListStore.create();
		}

		return this['groups_store'];
	},

	isContact: function (username) {
		return this.getFriendsList().isContact(username);
	},

	getMyContactsId: function () {
		if (!this.myContactsId) {
			this.myContactsId = Ext.String.format(this.MY_CONTACTS_PREFIX_PATTERN, $AppConfig.username);
		}
		return this.myContactsId;
	},

	getListStore: function (id) {
		var prefix = 'FriendsListStore:',
			pid = prefix + id;

		if (!this.friendsListStores) {
			this.friendsListStores = {};
		}

		if (!this.friendsListStores[pid]) {
			this.friendsListStores[pid] = new Ext.data.Store({model: 'NextThought.model.User', id: pid});
		}

		return this.friendsListStores[pid];
	},

	getContactGroup: function () {
		var contactsId = this.getMyContactsId(),
			store = this.getFriendsList();

		return this.contactGroup || store.findRecord('Username', contactsId, 0, false, true, true);
	},

	getAllContactsStore: function () {
		var flStore = this.getFriendsList(),
			contacts = flStore.getContacts();

		function isMyContactFilter (item) {
			return true;
		}

		if(!this.allContactsStore) {
			this.allContactsStore = ContactsStore.create({ filters: [isMyContactFilter], trackPresence: false });

			// In case the friendsList store has already been loaded, add contacts.
			if (!Ext.isEmpty(contacts)) {
				this.allContactsStore.addContacts(contacts);
			}
		}

		return this.allContactsStore;
	},

	getOnlineContactStore: function () {
		var me = this;
		function onlineFilter (item) {
			return item.get('Presence') && item.get('Presence').isOnline();
		}

		function isMyContactFilter (item) {
			return me.isContact(item);
		}

		if(!this.onlineContactsStore) {
			this.onlineContactsStore = ContactsStore.create({filters: [onlineFilter, isMyContactFilter]});
		}

		return this.onlineContactsStore;
	},

	setContactGroup: function (record) {
		var store = this.getFriendsList();

		this.contactGroup = (record instanceof Ext.data.Model && record.hasFriend) && record;

		store.suspendEvents(false);
		store.filter(function (rec) { return !rec.hidden; });
		store.resumeEvents();
		store.fireEvent('refilter');

		this.syncContacts();
	}
});
