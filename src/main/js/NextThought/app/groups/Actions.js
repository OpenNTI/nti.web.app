Ext.define('NextThought.app.groups.Actions', {
	extend: 'NextThought.common.Actions',

	requires: [
		'NextThought.login.StateStore',
		'NextThought.app.groups.StateStore'
	],


	constructor: function() {
		this.callParent(arguments);

		this.GroupStore = NextThought.app.groups.StateStore.getInstance();
		this.LoginStore = NextThought.login.StateStore.getInstance();

		this.LoginStore.registerLoginAction(this.loadFriendsList.bind(this));
	},


	loadFriendsList: function() {
		var me = this,
			store = me.GroupStore.getFriendsList(),
			mimeType = store.model.mimeType,
			collection = Service.getCollectionFor(mimeType, 'FriendsLists');

		$AppConfig.contactsGroupName = me.GroupStore.getMyContactsId();

		if (!collection || !collection.href) {
			return;
		}

		return new Promise(function(fulfill, reject) {
			store.on({
				load: function(listStore, records) {
					me.__friendsListsLoaded(listStore, records);
					fulfill();	
				}
			});

			store.proxy.url = getURL(collection.href);

			store.load();
		});
	},


	onLogin: function() {
		var store = this.GroupStore.getFriendsList(),
			mimeType = store.model.mimeType,
			collection = Service.getCollectionFor(mimeType, 'FriendsLists');

		$AppConfig.contactsGroupName = this.GroupStore.getMyContactsId();

		if (!collection || !collection.href) {
			return;
		}

		store.on({
			load: this.__friendsListsLoaded.bind(this)
		});

		store.proxy.url = getURL(collection.href);

		store.load();
	},


	__friendsListsLoaded: function(listStore, records) {
		var me = this, cid = this.GroupStore.getMyContactsId();

		(records || []).forEach(function(record) {
			var store;

			if (record.get('Username') === cid) {
				record.hidden = true;
				return;
			}

			store = me.GroupStore.getListStore(record.get('Username'));

			record.storeId = store.storeId;

			if (!record.isDFL) {
				console.debug('Resolving users from list:', record.get('Username'), 'potentially made # of requests:', record.get('friends').length);
				UserRepository.getUser(record.get('friends'))
					.then(function(friends) {
						store.loadData(friends);
						store.fireEvent('load', store, friends, true);
					});
			} else {
				console.debug('Not resolving users from DFL:', record.get('Username'), 'potentially saved # of requests:', record.get('friends').length);
			}
		});

		this.__ensureContactsGroup.apply(this, arguments);
	},


	__setContactGroup: function(record) {
		return this.GroupStore.setContactGroup(record);
	},


	getContactGroup: function() {
		return this.GroupeStore.getContactGroup();
	},


	__ensureContactsGroup: function(store, records, success) {
		var me = this, rec,
			id = this.GroupStore.getMyContactsId();

		if (!success) {
			console.log('Store load failed with arguments. Expect empty contacts', arguments);
			return;
		}

		rec = store.findRecordUnfiltered('Username', id, 0, false, true, true);

		if (!rec) {
			me.createGroupUnguarded('My Contacts', id, store.getContacts())
				.then(function(rec) {
					if (rec && rec.isModel) {
						rec.hidden = true;
						me.__setContactGroup(rec);
					} else {
						alert({
							icon: Ext.Msg.ERROR,
							title: 'Oops! :(',
							msg: 'There was an error initializing your contacts. ' +
								 'You will not be able to add/remove contacts until this is resolved. ' +
								 'This error has been reported and we are working on it.'
						});
						setTimeout(function() {
							//ensure this is caught by the error reporter. (and not Ext's layout engine or event handlers)
							Ext.Error.raise(JSON.stringify({
								msg: 'Failed to create contacts groupd',
								object: rec
							}));
						}, 1);
					}
				});
		}

		rec.hidden = true;
		me.__setContactGroup(rec);
	},


	createFriendsListUnguarded: function(displayName, username, friends, dynamic, callback, errorCallback, scope) {
		var me = this,
			rec = NextThought.model.FriendsList.create(),
			store = me.GroupStore.getFriendsList();

		rec.set('Username', username);
		//We used to set realname here, but we really want alias
		//realname doesn't even really make sense for [D]FLs.
		//Downside is failure to set realname here results in the ds
		//defaulting it to Username.
		rec.set('alias', displayName);
		rec.set('friends', friends || []);
		rec.set('IsDynamicSharing', !!dynamic);

		return new Promise(function(fulfill, reject) {
			rec.save({
				scope: me,
				success: function(record, operation) {
					var newStore = me.GroupStore.getListStore(username);

					record.storeId = newStore.storeId;

					wait(500)
						.then(store.add.bind(store, record));

					if (callback) {
						callback.call(scope, true, record, operation);
					}

					fulfill(record);
				},
				failure: function(record, operation, response) {
					if (errorCallback) {
						errorCallback.call(scope, record, operation, response);
					} else if (callback) {
						callback.call(scope, response);
					}

					reject();
				}
			});
		});
	},


	createGroupUnguarded: function(displayName, username, friends, callback, scope, error) {
		return this.createFriendsListUnguarded(displayName, username, friends, false, callback, scope, error);
	},


	deleteContact: function(user, groups) {
		var username = (user && user.isModel) ? user.get('Username') : user;

		return this.removeContact(null, username);
	},


	removeContact: function(record, contact) {
		var store = this.GroupStore.getFriendsList(),
			userId = typeof contact === 'string' ? contact : contact.get('Username'),
			count = Globals.getAsynchronousTaskQueueForList(store.getCount());

		return new Promise(function(fulfill, reject) {
			function finish() {
				if (!count.pop()) {
					fulfill();
				}
			}

			function revertEditOnError(group, oldValue) {
				return function() {
					console.warn('membership adjustment failed reverting to old value', group, oldValue, arguments);
					group.set('friends', oldValue);
				};
			}

			function remove(record) {
				var oldValue;
				if (record.hasFriend(userId)) {
					oldValue = record.get('friends').slice();
					record.removeFriend(userId).saveField('friends', undefined, finish, revertEditOnError(record, oldValue));
				}
				else {
					finish();
				}
			}

			if (record) {
				count = Globals.getAsynchronousTaskQueueForList(1);
				remove(record);
			} else {
				store.eachUnfiltered(function(g) {
					//Removing a contact shouldn't remove them from dfls
					if (!g.isDFL) {
						remove(g);
					} else {
						finish();
					}
				});
			}
		});
	},

	//TODO: figure out what groupList is suppose to be, I can't tell from the old code
	addContact: function(username, groupList) {
		var contactId = this.GroupStore.getMyContactsId(),
			contacts = this.GroupStore.getContactGroup(),
			tracker = Globals.getAsynchronousTaskQueueForList(groupList),
			oldContacts;

		if (isMe(username)) {
			console.warn('You should not add yourself to your groups.');
			return Promise.resolve();
		}

		return new Promise(function(fulfill, reject) {
			function finish() {
				if (!tracker.pop()) {
					fulfill();
				}
			}

			function revertEditOnError(group, oldValue) {
				return function() {
					console.warn('membership adjustment failed reverting to old value', group, oldValue, arguments);
					group.set('friends', oldValue);
				};
			}

			if (!contacts) {
				fulfill();
				return;
			}

			//TODO simplify this further
			if (!contacts.hasFriend(username)) {
				//add one just in case the contacts group is already in the list...
				if (groupList && groupList.length) {
					tracker.push({});
				}

				oldContacts = contacts.get('friends').slice();
				contacts.addFriend(username).saveField('friends', undefined, finish, revertEditOnError(contacts, oldContacts));
			}

			Ext.each(groupList, function(g) {
				var oldValue;
				if (g.get('Username') !== contactsId && !g.hasFriend(username)) {
					oldValue = g.get('friends').slice();
					g.addFriend(username).saveField('friends', undefined, finish, revertEditOnError(g, oldValue));
				}
				else {
					//skip it, we did this up front.
					finish();
				}
			});
		});
	}
});
