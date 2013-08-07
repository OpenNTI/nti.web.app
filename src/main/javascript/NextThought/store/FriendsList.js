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
			property : 'displayName',
			direction: 'ASC',
			transform: function(value) {
				return value.toLowerCase();
			}
		}
	],

	constructor: function(){
		this.callParent(arguments);

		this.on({
			scope: this,
			add: this.contactsMaybeAdded,
			remove: this.contactsMaybeRemoved,
			update: this.contactsMaybeChanged,
			refresh: this.fireContactsRefreshed
		});
	},


	search: function(query){
		var fieldsToMatch = ['alias'],
			regex = new RegExp(query, 'i'),
			matches;
		matches = this.queryBy(function(rec){
			var matched = false;

			Ext.Array.each(fieldsToMatch, function(field){
				var v = rec.get(field);
				if(v && regex.test(v)){
					matched = true;
				}
				return !matched;
			});

			return matched;
		});
		return matches;
	},


	//TODO make this a smart reload that requests new data with a proper last modified.
	//If we receive more data we should merge it in appropriately.  Updating any existing objects
	//whose last modified times are more recent, adding any new records and removing any records that
	//should no longer exist. Not sure where all that behavour hooks in but it should occur on reloads.
	reload: function(options){
		/*var ifModSince = this.lastModified ? this.lastModified.toUTCString() : undefined;

		if(ifModSince){
			this.proxy.headers = Ext.apply(this.proxy.headers, {
				'If-Modified-Since': ifModSince
			});
		}*/

		//Pass along a flag so we know this is a reload
		options = Ext.apply(options||{},{
			merge: true
		});

		return this.callParent([options]);
	},

	loadRecords: function(records, options){
		//console.log('load records called with', arguments); <-- this log message kills firefox's native tools
		if(options && options.merge){
			this.mergeRecords(records);
		}
		else{
			this.callParent(arguments);
		}
	},

	mergeRecords: function(newRecords){
		console.log('need to merge records', newRecords);
		var oldRecordIds = Ext.Array.map(this.data.items, function(i){return i.getId();}),
			toAdd = [];

		Ext.Array.each(newRecords, function(rec){
			var current = this.getById(rec.getId()),
				serverTime, localTime;

			//if we have one already merge based on last modified time
			if(current){
				//If the current last mod is newer on server we move
				//in.  In the webapp right now we should never
				//have a local last mod that is newer so we warn.
				serverTime = rec.get('Last Modified').getTime();
				localTime = current.get('Last Modified').getTime();

				if(serverTime > localTime){
					console.log('Merging', rec, ' into ', current);
					current.set(rec.raw);
				}
				else if(serverTime < localTime){
					console.warn('local last modified time < server last modified. What gives?', current, rec);
				}
			}
			else{
				toAdd.push(rec);
			}

			//now remove the id from oldRecordsIds
			Ext.Array.remove(oldRecordIds, rec.getId());
		}, this);

		//Any that are left in oldRecordsId no longer exist on the server
		//so we remove them
		console.log('Removing records with ids as part of merge', oldRecordIds);
		Ext.Array.each(oldRecordIds, function(id){
			this.removeAt(this.indexOfId(id));
		}, this);

		if(!Ext.isEmpty(toAdd)){
			console.log('Adding fls as part of merge', toAdd);
			this.add(toAdd);
		}
	},


	fireContactsRefreshed: function(){
		console.log('firing contacts refreshed');
		this.fireEvent('contacts-refreshed', this);
		this.fireEvent('contacts-updated');
	},


	/**
	 * TODO: The following functions handling sending contacts-added and contacts-removed events probably need to be
	 * optimized at some point
	 *
	 * @param {Array} newFriends
	 * @param {boolean} [noUpdatedEvent] @private
	 * @returns {boolean}
	 */
	maybeFireContactsAdded: function(newFriends, noUpdatedEvent){
		var contactsWithDups, newContacts = [];

		//console.log('Maybe added contacts', arguments);

		//If we aren't adding a new friends there is no way we added any new contacts
		if(Ext.isEmpty(newFriends)){
			return false;
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
			if(!noUpdatedEvent){
				this.fireEvent('contacts-updated');
			}
			return true;
		}
		return false;
	},

	contactsMaybeAdded: function(store, records){
		var newFriends = [];

		Ext.Array.each(records, function(rec){
			newFriends = Ext.Array.push(newFriends, rec.get('friends') || []);
		});

		this.maybeFireContactsAdded(newFriends);
	},


	maybeFireContactsRemoved: function(possiblyRemoved, /*boolean private*/noUpdatedEvent){
		var contacts, contactsRemoved = [];
		//console.log('Maybe removed contacts', arguments);

		if(Ext.isEmpty(possiblyRemoved)){
			return false;
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
			console.debug('Firing contacts removed', contactsRemoved);
			this.fireEvent('contacts-removed', contactsRemoved);
			if(!noUpdatedEvent){
				this.fireEvent('contacts-updated');
			}
			return true;
		}

		return false;
	},


	contactsMaybeRemoved: function(store, record){
		var possiblyRemoved = record.get('friends').slice();
		this.maybeFireContactsRemoved(possiblyRemoved);
	},


	contactsMaybeChanged: function(store, record, operation, fields){
		var field = (fields && fields[0]) || fields,
			newValue, oldValue, possibleAdds, possibleRemoves, fireUpdated;
		console.debug('Maybe updated contacts', arguments);

		if(operation !== Ext.data.Model.EDIT || field !== 'friends'){
			return;
		}

		newValue = record.get(field) || [];
		oldValue = record.modified[field] || [];

		//Things in new but not in old are new friends
		possibleAdds = Ext.Array.difference(newValue, oldValue);
		possibleRemoves = Ext.Array.difference(oldValue, newValue);
		if(this.maybeFireContactsAdded(possibleAdds, true)){
			fireUpdated = true;
		}
		if(this.maybeFireContactsRemoved(possibleRemoves, true)){
			fireUpdated = true;
		}
		if(fireUpdated){
			this.fireEvent('contacts-updated');
		}
	},


	/**
	 *
	 * @param {Boolean} [leaveDuplicates] @private
	 * @returns {Array}
	 */
	getContacts: function(leaveDuplicates){
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
