Ext.define('NextThought.store.UserSearch', {
	extend: 'Ext.data.Store',
	requires: [
		'NextThought.proxy.UserSearch'
	],

	model: 'NextThought.model.UserSearch',
	proxy: {
		type: 'usersearch',
		model: 'NextThought.model.UserSearch'
	},

	filters: [
		{ fn: function(rec) { return !isMe(rec); } },
		{ fn: function(rec) { return (!rec.isEveryone || !rec.isEveryone()); } }
	],

	sorters: [
		{sorterFn: function(a,b) {
			var list = this.contactsList, aa, bb;
			if (!this.contactsList || (new Date() - (this.lastUsed || 0)) > 0) {
				this.contactsList = list = Ext.getStore('FriendsList').getContacts();
				this.lastUsed = new Date();
			}

			aa = Ext.Array.contains(list, a.getId());
			bb = Ext.Array.contains(list, b.getId());

			return aa === bb ? 0 : aa ? -1 : 1;
		}},
		{property: 'displayName', direction: 'DESC'}
	],

	minRemoteSearchLength: 3,

	search: function(q) {
		var query = q || '',
			entities,
			flStore = Ext.getStore('FriendsList');

		if (query.length < this.minRemoteSearchLength) {
			entities = UserRepository.searchUser(query);
			if (flStore) {
				flStore.search(query).each(function(fl) {
					if (!entities.get(fl.getId())) {
						entities.add(fl.getId(), fl);
					}
				});
			}

			//User repository gives us back actual entities here
			//not the UserSearch models we want so we convert this to raw json
			//and call loadRawData
			entities = Ext.Array.map(entities.items, function(ent) {
				if (ent && ent.raw) {
					return ent.raw;
				}
				return null;
			});
			entities = Ext.Array.clean(entities);
			this.loadRawData({Items: entities});
		}
		else {
			this.load({
				params: {
					query: encodeURIComponent(query)
				}
			});
		}
	}
});
