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
			property : 'realname',
			direction: 'ASC'
		}
	],


	getFriends: function(callback){
		var distinct = {};

		this.each(function(group){
			Ext.each(group.get('friends'),function(f){ distinct[f] = true; });
		});

		UserRepository.prefetchUser(Object.keys(distinct),function(u){
			var friends = {Online: {}, Offline: {}};
			Ext.each(u,function(user){
				var p = user.get('Presence');
				if(p){ friends[p][user.getId()] = user; }
			});

			Ext.callback(callback,null,[friends]);
		});
	}
});
