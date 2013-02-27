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

	constructor: function(){
		var r = this.callParent(arguments);

		this.on({
			scope: this,
			write: this.onWrite,
			add: this.contactsMaybeAdded,
			remove: this.contactsMaybeRemoved,
			update: this.contactsMaybeChanged,
			load: this.fireContactsChanged
		});

		return r;
	},

	//Taken from PageItem store. move to subclass?
	onWrite: function(store, info) {
		if (info.action === 'destroy') {
			Ext.each(info.records, function(record){
				store.remove(record);
			});
		}
	},


	fireContactsChanged: function(){
		console.log('firing contacts changed');
		this.fireEvent('contacts-changed', this);
	},


	//TODO The following functions handling sending
	//contacts-added and contacts-removed events probably
	//need to be optimized at some point
	maybeFireContactsAdded: function(newFriends){
		var contactsWithDups, newContacts = [];

		//console.log('Maybe added contacts', arguments);

		//If we aren't adding a new friends there is no way we added any new contacts
		if(Ext.isEmpty(newFriends)){
			return;
		}

		contactsWithDups = this.getContacts(true);

		//If we remove newFriends from contactsWithDups
		//if there are any newFriends that no longer exist in contacts withDups
		//they became contacts with this add
		Ext.Array.each(newFriends, function(newFriend){
			contactsWithDups = Ext.Array.remove(contactsWithDups, newFriend);
		});

		Ext.Array.each(newFriends, function(newFriend){
			if(!Ext.Array.contains(contactsWithDups, newFriend)){
				newContacts.push(newFriend);
			}
		});

		if(!Ext.isEmpty(newContacts)){
			console.log('Firing contacts added', newContacts);
			this.fireEvent('contacts-added', newContacts);
		}
	},

	contactsMaybeAdded: function(store, records){
		var newFriends = [];

		Ext.Array.each(records, function(rec){
			newFriends = Ext.Array.push(newFriends, rec.get('friends') || []);
		});

		this.maybeFireContactsAdded(newFriends);
	},


	maybeFireContactsRemoved: function(possiblyRemoved){
		var contacts, contactsRemoved = [];
		//console.log('Maybe removed contacts', arguments);

		if(Ext.isEmpty(possiblyRemoved)){
			return;
		}

		contacts = this.getContacts();

		//If the things we think were removed still exist in contacts they must
		//exist somewhere else
		Ext.Array.each(possiblyRemoved, function(maybeRemoved){
			if(!Ext.Array.contains(contacts, maybeRemoved)){
				contactsRemoved.push(maybeRemoved);
			}
		});

		if(!Ext.isEmpty(contactsRemoved)){
			console.log('Firing contacts removed', contactsRemoved);
			this.fireEvent('contacts-removed', contactsRemoved);
		}
	},


	contactsMaybeRemoved: function(store, record){
		var possiblyRemoved = record.get('friends').slice();
		this.maybeFireContactsRemoved(possiblyRemoved);
	},


	contactsMaybeChanged: function(store, record, operation, field){
		var newValue, oldValue, possibleAdds, possibleRemoves;
		//console.log('Maybe updated contacts', arguments);

		if(operation !== Ext.data.Model.EDIT || field !== 'friends'){
			return;
		}

		newValue = record.get(field) || [];
		oldValue = record.modified[field] || [];

		//Things in new but not in old are new friends
		possibleAdds = Ext.Array.difference(newValue, oldValue);
		possibleRemoves = Ext.Array.difference(oldValue, newValue);
		this.maybeFireContactsAdded(possibleAdds);
		this.maybeFireContactsRemoved(possibleRemoves);
	},


	getContacts: function(/*private*/leaveDuplicates){
		var names = [];
		this.each(function(g){
			//Only people in your lists are your contacts.
			//skip dfls
			if(!g.isDFL){
				names.push.apply(names,g.get('friends'));
			}
		});
		if(!leaveDuplicates){
			names = Ext.Array.sort(Ext.Array.unique(names));
		}

		//Usually you don't end up in friendslist but now that everyone is dfl crazy you do.
		//This means you show up in your own contacts list (definately not desirable) and
		//beneath any dfls you are a member of (questionable at this point).  Aaron claims the
		//latter isn't allowed right now either.  Strip the appuser from contacts fixes both.
		//
		//Note: now that we are skipping dfls above, we probably don't need to do this
		names = Ext.Array.remove(names, $AppConfig.username);
		return names;
	},


	getConnections: function(){
		var names = [];

		//Connections: include all my contacts + people in my dfls.
		this.each(function(g){
			if(g.isDFL){
				names.push(g.get('Creator'));
			}
			names.push.apply(names, g.get('friends'));
		});

		names = Ext.Array.sort(Ext.Array.unique(names));
		names = Ext.Array.remove(names, $AppConfig.username);
		return names;
	},

	isContact: function(username){
		if(username && username.isModel){
			username = username.get('Username');
		}
		//Rather than building the contacts array and doing a contains
		//check this could be optimized if needed.
		return Ext.Array.contains(this.getContacts(),username);
	},

	isConnected: function(username){
		if(username && username.isModel){
			username = username.get('Username');
		}

		return Ext.Array.contains( this.getConnections(), username);
	}
});
