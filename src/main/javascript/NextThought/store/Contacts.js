Ext.define('NextThought.store.Contacts',{
	extend: 'Ext.data.Store',
	model: 'NextThought.model.forums.PersonalBlogEntry',

	proxy: 'memory',
	remoteSort: false,
	remoteFilter: false,
	remoteGroup: false,
	sortOnFilter: true,
	sorters:[{
		property: 'displayName',
		direction: 'ASC',
		transform: function(value) { return value.toLowerCase(); }
	}],

	bindFriendsListAndPresence: function(fs, ps){
		var flListeners = {
				scope: this,
				'contacts-added': 'addContacts',
				'contacts-removed': 'removeContacts',
				'contacts-refreshed': 'refreshContacts'
			},
			piListeners = {
				scope: this,
				'presence-changed': 'onPresenceChange'
			};


		if(this.flStore){
			this.flStore.un(flListeners);
		}

		if(this.piStore){
			this.piStore.un(piListeners);
		}

		this.flStore = fs;
		this.piStore = ps;

		if(this.flStore){
			this.flStore.on(flListeners);
		}

		if(this.piStore){
			this.piStore.on(piListeners);
		}
	},

	onPresenceChange: function(username, rec){
		if(!rec.isPresenceInfo){
			return;
		}
		var fn = rec.isOnline && rec.isOnline() ? 'addContacts' : 'removeContacts';
		this[fn]([username]);
	},

	contains: function(id){
		return 0 <= this.indexOfId(id);
	},

	indexOfId: function(id){
		return (this.snapshot || this.data).findIndexBy(function(rec){
			return rec.isEqual(rec.get('Username'), id);
		}, this, 0);
	},

	doesItemPassFilter: function(item){
		var pass = true;

		this.filters.each(function(filter){
			if(!filter.filterFn(item)){
				pass = false;
			}
			return pass;
		});

		return pass;
	},

	addContacts: function(contacts){
		var toAdd = [], me = this;
		UserRepository.getUser(contacts, function(users){
			Ext.Array.each(users, function(user){
				if(!isMe(user) && me.doesItemPassFilter(user) && !me.contains(user.getId())){
					toAdd.push(user);
				}
			});
			if(!Ext.isEmpty(toAdd)){
				me.add(toAdd);
			}
		});
	},

	removeContacts: function(contacts){
		var toRemove = [], me = this;
		Ext.Array.each(contacts, function(contact){
			var idx = me.indexOfId(contact.getId ? contact.getId() : contact);
			if(idx >= 0){
				toRemove.push((me.snapshot||me.data).getAt(idx));
			}
		});
		if(!Ext.isEmpty(toRemove)){
			me.remove(toRemove);
		}
	},

	refreshContacts: function(listStore){
		//TODO smarter merge here
		this.removeAll();
		this.addContacts(listStore.getContacts());
	}
});