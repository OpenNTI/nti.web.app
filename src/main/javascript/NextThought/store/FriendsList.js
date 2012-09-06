Ext.define('NextThought.store.FriendsList',{
	extend: 'Ext.data.Store',

	model: 'NextThought.model.FriendsList',

	autoLoad: false,

	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,
	sortOnFilter: true,

	proxy: {
		type: 'rest',
		reader: {
			type: 'nti',
			root: 'Items'
		},
		headers: {
			'Accept': 'application/vnd.nextthought.collection+json',
			'Content-Type': 'application/vnd.nextthought.friendslist+json'
		},
		model: 'NextThought.model.FriendsList'
	},

	filters: {
		fn: function(rec){
			return !rec.isEveryone();
		}
	},

	sorters: [
		{
			//Sort system groups to the front
			sorterFn: function(a,b){
				var ac = a.isSystem(),
					bc = b.isSystem();
				return ac === bc ? 0 : ac ? -1 : 1;
			}
		},
		{
			property : 'displayName',
			direction: 'ACE'
		}
	],



	getContacts: function(){
		var names = [];
		this.each(function(g){ names.push.apply(names,g.get('friends')); });
		return Ext.Array.sort(Ext.Array.unique(names));
	}
});
