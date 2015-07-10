Ext.define('NextThought.app.groups.StateStore', {
	extend: 'NextThought.common.StateStore',


	requires: [
		'NextThought.store.FriendsList',
		'NextThought.app.chat.StateStore',
		'NextThought.store.Contacts'
	],


	MY_CONTACTS_PREFIX_PATTERN: 'mycontacts-{0}',


	getFriendsList: function() {
		if (!this.friends_list_store) {
			this.friends_list_store = NextThought.store.FriendsList.create();
		}

		return this.friends_list_store;
	},


	isContact: function(username) {
		return this.getFriendsList().isContact(username);
	},


	getMyContactsId: function() {
		if (!this.myContactsId) {
			this.myContactsId = Ext.String.format(this.MY_CONTACTS_PREFIX_PATTERN, $AppConfig.username);
		}
		return this.myContactsId;
	},


	getListStore: function(id) {
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


	getContactGroup: function() {
		var contactsId = this.getMyContactsId(),
			store = this.getFriendsList();

		return this.contactGroup || store.findRecord('Username', contactsId, 0, false, true, true);
	},


	getAllContactsStore: function() {
		var me = this,
			flStore = this.getFriendsList(),
			contacts = flStore.getContacts();

		function isMyContactFilter (item) {
			return me.isContact(item);
		}

		if(!this.allContactsStore) {
			this.allContactsStore = NextThought.store.Contacts.create({ filters: [isMyContactFilter] });

			// In case the friendsList store has already been loaded, add contacts.
			if (!Ext.isEmpty(contacts)) {
				this.allContactsStore.addContacts(contacts);
			}
		}

		return this.allContactsStore;
	},


	getOnlineContactStore: function() {
		var me = this;
		function onlineFilter(item) {
			return item.get('Presence') && item.get('Presence').isOnline();
		}

		function isMyContactFilter (item) {
			return me.isContact(item);
		}

		if(!this.onlineContactsStore) {
			this.onlineContactsStore = NextThought.store.Contacts.create({filters: [onlineFilter, isMyContactFilter]});
		}

		return this.onlineContactsStore;
	},


	setContactGroup: function(record) {
		var store = this.getFriendsList();

		this.contactGroup = (record instanceof Ext.data.Model && record.hasFriend) && record;

		store.suspendEvents(false);
		store.filter(function(rec) { return !rec.hidden; });
		store.resumeEvents();
		store.fireEvent('refilter');
	}
});
