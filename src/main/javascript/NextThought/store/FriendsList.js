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

	sorters: [
		{
			//Sort system groups to the front
			sorterFn: function(a,b){
				var ac = a.isSystem();
				var bc = b.isSystem();
				return ac === bc ? 0 : ac ? -1 : 1;
			}
		},
		{
			property : 'realname',
			direction: 'ACE'
		}
	]
});
