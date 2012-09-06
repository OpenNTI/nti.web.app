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
			return !rec.isSystem || !rec.isSystem();
		}
	},

	sorters: [
		{
			//Sort into three groups everything else, then my contacts, the offline
			sorterFn: function(a,b){
				console.log(a.get('Username'));
				console.log(b.get('Username'));
				//This is a pretty fragile way to be doing this.  This is a quick
				//sort fix though...

				var aIsMyContacts = (/mycontacts-*/).test(a.get('Username'));
					bIsMyContacts = (/mycontacts-*/).test(b.get('Username'));

				if(aIsMyContacts === bIsMyContacts){
					return 0;
				}

				return aIsMyContacts ? 1 : -1;

			}
		},
		{
			property : 'displayName',
			direction: 'ACE',
			transform: function(value) {
                    return value.toLowerCase();
            }
		}
	],

	getContacts: function(){
		var names = [];
		this.each(function(g){ names.push.apply(names,g.get('friends')); });
		return Ext.Array.sort(Ext.Array.unique(names));
	}
});
