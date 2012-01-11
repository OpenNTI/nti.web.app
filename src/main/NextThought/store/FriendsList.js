Ext.define('NextThought.store.FriendsList',{
	extend: 'Ext.data.Store',

	model: 'NextThought.model.FriendsList',

	autoLoad: false,

	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,

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
//			sorterFn: function(o1, o2){
//				function f(o){ return (/@/).test(o.get('Username')); }
//				var a = f(o1), b = f(o2);
//				return a==b ? 0 : a ? -1 : 1;
//			}
//		},{
			property : 'realname',
			direction: 'ASC'
		}
	]
});
