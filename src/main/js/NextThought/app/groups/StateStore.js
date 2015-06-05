Ext.define('NextThought.app.groups.StateStore', {
	extend: 'NextThought.common.StateStore',


	requires: ['NextThought.store.FriendsList'],


	MY_CONTACTS_PREFIX_PATTERN: 'mycontacts-{0}',


	getFriendsList: function() {
		if (!this.friends_list_store) {
			this.friends_list_store = NextThought.store.FriendsList.create();
		}

		return this.friends_list_store;
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


	setContactGroup: function(record) {
		var store = this.getFriendsList();

		this.contactGroup = (record instanceof Ext.data.Model && record.hasFriend) && record;

		store.suspendEvents(false);
		store.filter(function(rec) { return !rec.hidden; });
		store.resumeEvents();
		store.fireEvent('refilter');
	}
});
