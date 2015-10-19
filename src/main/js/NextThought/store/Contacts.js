Ext.define('NextThought.store.Contacts', {
	extend: 'Ext.data.Store',
	model: 'NextThought.model.User',

	proxy: 'memory',
	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,
	sortOnFilter: true,
	trackPresence: true,
	sorters: [
		{
			property: 'displayName',
			direction: 'ASC',
			transform: function(value) { return value && value.toLowerCase(); }
		}
	],


	constructor: function() {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.ChatStore = NextThought.app.chat.StateStore.getInstance();

		this.mon(this.GroupStore.getFriendsList(), {
			'contacts-added': this.addContacts.bind(this),
			'contacts-removed': this.removeContacts.bind(this),
			'contacts-refreshed': this.refreshContacts.bind(this),
			'load': this.friendsListStoreLoad.bind(this)
		});

		if (this.trackPresence) {
			this.mon(this.ChatStore, {
				'presence-changed': this.onPresenceChange.bind(this)
			});
		}
	},


	friendsListStoreLoad: function(store, records) {
		this.parentLoaded = true;
		this.fireEvent('parent-store-loaded', store, records);
	},

	onPresenceChange: function(username, rec) {
		if (!rec.isPresenceInfo || (this.flStore && !this.flStore.isContact(username))) {
			return;
		}
		var fn = rec.isOnline && rec.isOnline() ? 'addContacts' : 'removeContacts';
		this[fn]([username]);
	},

	contains: function(id) {
		return 0 <= this.indexOfId(id);
	},

	indexOfId: function(id) {
		return (this.snapshot || this.data).findIndexBy(function(rec) {
			return rec.isEqual(rec.get('Username'), id);
		}, this, 0);
	},

	doesItemPassFilter: function(item) {
		var pass = true;

		this.filters.each(function(filter) {
			if (!filter.filterFn(item)) {
				pass = false;
			}
			return pass;
		});

		return pass;
	},

	addContacts: function(contacts) {
		var toAdd = [], me = this;
		UserRepository.getUser(contacts, function(users) {
			Ext.each(users, function(user) {
				if (!isMe(user) && me.doesItemPassFilter(user) && !me.contains(user.getId())) {
					toAdd.push(user);
				}
			});
			if (!Ext.isEmpty(toAdd)) {
				me.add(toAdd);
			}
		});
	},

	removeContacts: function(contacts) {
		var toRemove = [], me = this;
		Ext.each(contacts, function(contact) {
			var idx = me.indexOfId(contact.getId ? contact.getId() : contact);
			if (idx >= 0) {
				toRemove.push((me.snapshot || me.data).getAt(idx));
			}
		});
		if (!Ext.isEmpty(toRemove)) {
			me.remove(toRemove);
		}
	},

	refreshContacts: function(listStore) {
		//TODO smarter merge here
		this.removeAll();
		this.addContacts(listStore.getContacts());
	}
});
