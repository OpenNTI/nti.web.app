const Ext = require('extjs');
const {wait} = require('nti-commons');

const UserRepository = require('legacy/cache/UserRepository');
const Globals = require('legacy/util/Globals');
const ParseUtils = require('legacy/util/Parsing');
const LoginStateStore = require('legacy/login/StateStore');
const FriendsList = require('legacy/model/FriendsList');
const DynamicFriendsList = require('legacy/model/DynamicFriendsList');

const GroupsStateStore = require('./StateStore');

const {guidGenerator, isMe, getURL} = Globals;

require('legacy/common/Actions');


module.exports = exports = Ext.define('NextThought.app.groups.Actions', {
	extend: 'NextThought.common.Actions',


	constructor: function () {
		this.callParent(arguments);

		this.GroupStore = GroupsStateStore.getInstance();
		this.LoginStore = LoginStateStore.getInstance();

		this.LoginStore.registerLoginAction(this.loadFriendsList.bind(this));
		this.LoginStore.registerLoginAction(this.loadGroupsList.bind(this));
	},


	loadFriendsList: function () {
		var me = this,
			store = me.GroupStore.getFriendsList(),
			mimeType = store.model.mimeType,
			collection = Service.getCollectionFor(mimeType, 'FriendsLists');

		$AppConfig.contactsGroupName = me.GroupStore.getMyContactsId();

		if (!collection || !collection.href) {
			return;
		}

		return new Promise(function (fulfill) {
			store.on({
				load: function (listStore, records, success) {
					me.__friendsListsLoaded(listStore, records, success);
					fulfill();
				}
			});

			store.proxy.url = getURL(collection.href);

			store.load();
		});
	},


	loadGroupsList: function () {
		var me = this,
			store = me.GroupStore.getGroupsList(),
			collection = Service.getCollection('Groups');

		if (!collection || !collection.href) {
			return;
		}

		return new Promise(function (fulfill) {
			store.on({
				load: function (/*listStore, records, success*/) {
					fulfill();
				}
			});

			store.proxy.url = getURL(collection.href);

			store.load();
		});

	},


	onLogin: function () {
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


	__friendsListsLoaded: function (listStore, records) {
		var me = this, cid = this.GroupStore.getMyContactsId();

		(records || []).forEach(function (record) {
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
					.then(function (friends) {
						store.loadData(friends);
						store.fireEvent('load', store, friends, true);
					});
			} else {
				console.debug('Not resolving users from DFL:', record.get('Username'), 'potentially saved # of requests:', record.get('friends').length);
			}
		});

		this.__ensureContactsGroup.apply(this, arguments);
	},


	__setContactGroup: function (record) {
		return this.GroupStore.setContactGroup(record);
	},


	getContactGroup: function () {
		return this.GroupeStore.getContactGroup();
	},


	__ensureContactsGroup: function (store, records, success) {
		var me = this, rec,
			id = this.GroupStore.getMyContactsId();

		if (!success) {
			console.log('Store load failed with arguments. Expect empty contacts', arguments);
			return;
		}

		rec = store.findRecordUnfiltered('Username', id, 0, false, true, true);

		if (!rec) {
			me.createGroupUnguarded('My Contacts', id, store.getContacts())
				.then(function (record) {
					if (record && record.isModel) {
						record.hidden = true;
						me.__setContactGroup(record);
					} else {
						alert({
							icon: Ext.Msg.ERROR,
							title: 'Oops! :(',
							msg: 'There was an error initializing your contacts. ' +
									'You will not be able to add/remove contacts until this is resolved. ' +
									'This error has been reported and we are working on it.'
						});
						setTimeout(function () {
							//ensure this is caught by the error reporter. (and not Ext's layout engine or event handlers)
							Ext.Error.raise(JSON.stringify({
								msg: 'Failed to create contacts groupd',
								object: record
							}));
						}, 1);
					}
				});
		} else {
			rec.hidden = true;
			me.__setContactGroup(rec);
		}
	},


	createFriendsListUnguarded: function (displayName, username, friends, dynamic, callback, errorCallback, scope) {
		var me = this,
			rec = dynamic ? DynamicFriendsList.create() : FriendsList.create(),
			store = dynamic ? me.GroupStore.getGroupsList() : me.GroupStore.getFriendsList();

		rec.set('Username', username);
		//We used to set realname here, but we really want alias
		//realname doesn't even really make sense for [D]FLs.
		//Downside is failure to set realname here results in the ds
		//defaulting it to Username.
		rec.set('alias', displayName);
		rec.set('friends', friends || []);
		rec.set('IsDynamicSharing', !!dynamic);

		return new Promise(function (fulfill, reject) {
			rec.save({
				scope: me,
				success: function (record, operation) {
					var newStore = me.GroupStore.getListStore(username);

					record.storeId = newStore.storeId;

					wait(500)
						.then(store.add.bind(store, [record]));

					if (callback) {
						callback.call(scope, true, record, operation);
					}

					fulfill(record);
				},
				failure: function (record, operation, response) {
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


	createGroupUnguarded: function (displayName, username, friends, callback, scope, error) {
		return this.createFriendsListUnguarded(displayName, username, friends, false, callback, scope, error);
	},


	deleteContact: function (user/*, groups*/) {
		var username = (user && user.isModel) ? user.get('Username') : user;

		return this.removeContact(null, username);
	},


	removeContact: function (record, contact) {
		var store = this.GroupStore.getFriendsList(),
			userId = typeof contact === 'string' ? contact : contact.get('Username'),
			count = Globals.getAsynchronousTaskQueueForList(store.getCount());

		return new Promise(function (fulfill) {
			function finish () {
				if (!count.pop()) {
					fulfill();
				}
			}

			function revertEditOnError (group, oldValue) {
				return function () {
					console.warn('membership adjustment failed reverting to old value', group, oldValue, arguments);
					group.set('friends', oldValue);
				};
			}

			function remove (rec) {
				var oldValue;
				if (rec.hasFriend(userId)) {
					oldValue = rec.get('friends').slice();
					rec.removeFriend(userId).saveField('friends', undefined, finish, revertEditOnError(rec, oldValue));
				}
				else {
					finish();
				}
			}

			if (record) {
				count = Globals.getAsynchronousTaskQueueForList(1);
				remove(record);
			} else {
				store.eachUnfiltered(function (g) {
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
	addContact: function (username, groupList) {
		var contactId = this.GroupStore.getMyContactsId(),
			contacts = this.GroupStore.getContactGroup(),
			tracker = Globals.getAsynchronousTaskQueueForList(groupList),
			oldContacts;

		if (isMe(username)) {
			console.warn('You should not add yourself to your groups.');
			return Promise.resolve();
		}

		return new Promise(function (fulfill) {
			function finish () {
				if (!tracker.pop()) {
					fulfill();
				}
			}

			function revertEditOnError (group, oldValue) {
				return function () {
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

			Ext.each(groupList, function (g) {
				var oldValue;
				if (g.get('Username') !== contactId && !g.hasFriend(username)) {
					oldValue = g.get('friends').slice();
					g.addFriend(username).saveField('friends', undefined, finish, revertEditOnError(g, oldValue));
				}
				else {
					//skip it, we did this up front.
					finish();
				}
			});
		});
	},


	createDFLUnguarded: function (displayName, username, friends, callback, error, scope) {
		return this.createFriendsListUnguarded(displayName, username, friends, true, callback, error, scope);
	},


	createList: function (displayName, friends) {
		if (!Service.canFriend()) {
			Ext.Error.raise('Permission denied.	 AppUser is not allowed to create lists');
			return Promise.reject();
		}

		var username = this.generateUsername(displayName),
			me = this;

		if (Ext.isEmpty(displayName)) {
			return Promise.reject();
		}

		return new Promise(function (fulfill, reject) {
			me.createGroupUnguarded(displayName, username, friends)
				.then(function (record) {
					fulfill(record);
				})
				.catch(function (record, operation, response) {
					var msg = response.message,
						field = response.field,
						code = response.code;

					if (msg) {
						if (field) {
							msg = msg.replace(field, 'List name');
						}
					}
					msg = NTIError.getError(code, {'name': 'List name'}, msg);
					if (!msg && operation.error && operation.error === 422) {
						//Well a field was wrong, in this case the user only put one thing
						//in so tell him that is invalid
						msg = 'Invalid list name ' + displayName;
					}

					reject(msg);
				});
		});
	},


	createGroupAndCode: function (btn) {
		var w = btn.up('window'), username, displayName, me = this;

		if (!Service.canCreateDynamicGroups()) {
			Ext.Error.raise('Permission denied.	 AppUser is not allowed to create dfls');
			return Promise.reject();
		}

		displayName = w.getGroupName();
		username = this.generateUsername(displayName);
		console.log('Create group with name ' + displayName);
		btn.setDisabled(true);

		return new Promise(function (fulfill, reject) {
			me.createDFLUnguarded(displayName, username)
					.then(function (record) {
						return me.fetchGroupCode(record, displayName);
					})
					.then(function (code) {
						fulfill(code);
					})
					.catch(function (rec, operation, response) {
						var msg = response && response.message,
							field = response && response.field,
							code = response && response.code;

						if (msg) {
							//get the error from the error util
							if (field) {
								msg = msg.replace(field, 'Group Name');
							}
						}

						msg = NTIError.getError(code, {'name': 'Group name'}, msg);

						if (!msg && operation.error && operation.error === 422) {
							//Well a field was wrong, in this case the user only put one thing
							//in so tell him that is invalid
							msg = 'Invalid group name ' + displayName;
						}

						reject(msg);
					});
		});
	},


	fetchGroupCode: function (record, displayName, success, onError) {
		var link = record.getLink('default-trivial-invitation-code');

		if (!link) {
			Ext.callback(onError, this, ['Group code cannot be created for ' + displayName]);
			return Promise.reject();
		}

		return new Promise(function (fulfill, reject) {
			Ext.Ajax.request({
				url: link,
				scope: this,
				method: 'GET',
				headers: {
					Accept: 'application/json'
				},
				callback: function (q, s, r) {
					console.log(r.responseText);
					var result, errorText = 'An error occurred generating \'Group Code\' for ' + displayName;
					if (s) {
						result = Ext.decode(r.responseText, true);
						result = result ? result.invitation_code : null;
					}
					if (!result) {
						Ext.callback(onError, this, [errorText + ' : ' + r.status]);
						reject(q, s, r);
					}
					else {
						Ext.callback(success, this, [result]);
						fulfill(result);
					}
				}
			});
		});
	},


	getGroupCode: function (record) {
		var dn = record.get('displayName');
		return this.fetchGroupCode(record, dn);
	},


	escapeGroupName: function (name) {
		//Dataserver blows chunks if on @@ or @( at the beginning
		//look for these things and yank them out.	This was happening
		//when manipulating the list by the object url (say for deletion).
		name = name.replace(/@@|@\(/ig, '');
		return name.replace(/[^0-9A-Z\-@\+\._]/ig, '');
	},


	generateUsername: function (newGroupName) {
		return this.escapeGroupName(newGroupName) + '-' + $AppConfig.username + '_' + guidGenerator();
	},


	getAcceptsLink () {
		let collection = Service.getCollection('Invitations', 'Invitations');
		let links = collection && collection.Links;

		return Service.getLinkFrom(links || [], 'accept-invitations');
	},


	joinGroupWithCode: function (code/*, btn*/) {
		var data = {'invitation_codes': [code]},
			url = this.getAcceptsLink(),
			me = this;

		if (!url) {
			return Promise.reject({field: 'Code', message: 'There was an error applying your Group Code.'});
		}

		return new Promise(function (fulfill, reject) {
			Ext.Ajax.request({
				url: getURL(url),
				scope: this,
				jsonData: Ext.encode(data),
				method: 'POST',
				headers: {
					Accept: 'application/json'
				},
				callback: function (q, success/*, r*/) {
					var store;

					if (!success) {
						reject({field: 'Group Code', message: 'The code you entered is not valid.'});
					}
					else {
						store = me.GroupStore.getFriendsList();
						if (store) {
							console.warn('Performing expensive reload of friends list store.', store);
							store.reload();
						}
						me.loadGroupsList();
						fulfill();
					}
				}
			});
		});
	},


	deleteGroup: function (record) {
		if (record.get('Username') !== this.getMyContactsId()) {
			record.destroy({
				callback: function (recs, op, success) {
					if (!success) {
						alert('Unable to delete group.');
					}
				}
			});
		}
	},


	leaveGroup: function (record) {
		var link = record.getLink('my_membership'),
			groupStore = this.GroupStore.getGroupsList(),
			dn = record.get('displayName'), me = this;

		if (!link) {
			return Promise.reject('Unable to leave ' + dn);
		}

		return new Promise(function (fulfill, reject) {
			Ext.Ajax.request({
				url: link,
				scope: this,
				method: 'DELETE',
				headers: {
					Accept: 'application/json'
				},
				callback: function (q, s, r) {
					console.log(r.responseText);
					var errorText = 'An error occurred leaving	' + dn,
						result;

					if (s) {
						result = Ext.decode(r.responseText, true);
						result = ParseUtils.parseItems(result);
					}

					if (Ext.isEmpty(result)) {
						reject(errorText + ' : ' + r.status);
					}
					else {
						//onSuccess instead of reloading the whole store
						//lets try and just remove the one thing we need
						me.GroupStore.getFriendsList().remove(record);
						groupStore.remove(record);
						fulfill();
					}
				}
			});
		});
	},


	getMyContactsId: function () {
		if (!this.myContactsId) {
			this.myContactsId = Ext.String.format('mycontacts-{0}', $AppConfig.username);
		}
		return this.myContactsId;
	}
});
