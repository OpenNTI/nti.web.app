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
			sorterFn: function(a,b){
				var ac = a.get('Creator');
				var bc = b.get('Creator');
				var sys = 'zope.security.management.system_user';
				return ac === bc
						? 0
						: ac == sys ? -1 : 1;
			}
		},
		{
			property : 'realname',
			direction: 'ACE'
		}
	]
});
