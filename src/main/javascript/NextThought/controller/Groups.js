Ext.define('NextThought.controller.Groups', {
	extend: 'Ext.app.Controller',


	models: [
		'Community',
		'FriendsList',
		'User',
		'UserSearch'
	],


	stores: [
		'FriendsList'
	],


	views: [
		'account.coderetrieval.Window',
		'account.contacts.management.GroupList',
		'account.contacts.management.Person',
		'account.contacts.management.AddGroup',
		'account.codecreation.Main',
		'account.contacts.createlist.Main',
		'contacts.Panel',
		'contacts.TabPanel',
		'contacts.Card'
	],


	MY_CONTACTS_PREFIX_PATTERN: 'mycontacts-{0}',


	init: function() {
		var flStore = this.getFriendsListStore(),
			piStore = Ext.StoreManager.get('PresenceInfo'),//reduce this coupling
			me = this;

		this.application.on('session-ready', this.onSessionReady, this);

		function onlineFilter(item){ return item.get('Presence') && item.get('Presence').isOnline(); }

		//The flStore already has tons of logic in it to fire contact changes
		//at appropriate times.  So turn our onlineContactStore into a store
		//that is driven off of those notifications further filtering things appropriately
		this.onlineContactStore = new Ext.data.Store({
			model: 'NextThought.model.User',
			id: 'online-contacts-store',
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

			contains: function(id){
				return 0 <= this.indexOfId(id);
			},

			indexOfId: function(id){
				return (this.snapshot || this.data).findIndexBy(function(rec){
						return rec.isEqual(rec.get('Username'), id);
				}, this, 0);
			},

			addContacts: function(contacts){
				var toAdd = [], me = this;
				UserRepository.getUser(contacts, function(users){
					Ext.Array.each(users, function(user){
						if(!isMe(user) && onlineFilter(user) && !me.contains(user.getId())){
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

		flStore.on({
			scope: this.onlineContactStore,
			'contacts-added': 'addContacts',
			'contacts-removed': 'removeContacts',
			'contacts-refreshed': 'refreshContacts'
		});

		piStore.on('presence-changed', function(username, rec){
			if(!rec.isPresenceInfo){
				return;
			}
			var fn = rec.isOnline && rec.isOnline() ? 'addContacts' : 'removeContacts';
			me.onlineContactStore[fn]([rec]);
		});

		this.listen({
			component:{
				'*':{
					'add-contact': 'addContact',
					'add-group': 'addGroup',
					'delete-group': 'deleteGroup',
					'delete-contact': 'deleteContact',
					'leave-group': 'leaveGroup',
					'remove-contact': 'removeContact',
					'get-group-code': 'getGroupCode',
					'create-group-code': 'createGroupAndCode',
					'create-list': 'addList'
				}
			}
		});
	},


	onSessionReady: function(){
		var store = this.getFriendsListStore(),
			mime = (new store.model()).mimeType,
			coll = $AppConfig.service.getCollectionFor(mime,'FriendsLists');

		$AppConfig.contactsGroupName = this.getMyContactsId();

		if(!coll || !coll.href){return;}

		store.on({
			scope: this,
			load: 'friendsListsLoaded'
		});

		store.proxy.url = getURL(coll.href);

		store.load();
	},


	getListStore: function(id){
		var prefix = 'FriendsListStore:',
			pid = prefix + id;

		if(!this.friendsListStores){
			this.friendsListStores = {};
		}

		if(!this.friendsListStores[pid]){
			this.friendsListStores[pid] = new Ext.data.Store({model: 'NextThought.model.User',id:pid});
		}

		return this.friendsListStores[pid];
	},


	getMyContactsId: function(){
		if(!this.myContactsId){
			this.myContactsId = Ext.String.format(this.MY_CONTACTS_PREFIX_PATTERN,$AppConfig.username);
		}
		return this.myContactsId;
	},


	ensureContactsGroup: function(store, records, success){
		var id = this.getMyContactsId(), rec, contacts;

		if(!success){
			console.log('Store load failed with arguments. Expect empty contacts', arguments);
			return;
		}

		rec = store.findRecord('Username',id,0,false,true,true);
		if(!rec){
			this.createGroupUnguarded('My Contacts', id, store.getContacts(),function(success,rec){
				rec.hidden = true;
			});
			return;
		}

		rec.hidden = true;
	},


	friendsListsLoaded: function(store,records){
		var me = this, cid = me.getMyContactsId();

		Ext.each(records,function(r){
			if(r.get('Username')===cid){
				r.hidden = true;
				return;
			}
			var store = me.getListStore(r.get('Username'));

			r.storeId = store.storeId;

			UserRepository.getUser(r.get('friends'),function(friends){
				store.loadData(friends);
				store.fireEvent('load',store,friends,true);
			});
		});

		this.ensureContactsGroup.apply(this, arguments);
	},


	generateUsername: function(newGroupName){
		return newGroupName
				.replace(/[^0-9A-Z\-@\+\._]/ig, '')
				+'-'+ $AppConfig.username+'_'+guidGenerator();
	},


	addGroup: function(newGroupName, friends, callback, scope){
		var username = this.generateUsername(newGroupName);

		this.createGroupUnguarded(newGroupName,username,friends||[],callback,scope||this);
	},


	createFriendsListUnguarded: function(displayName, username, friends, dynamic, callback, errorCallback, scope){
		var me = this,
			rec = me.getFriendsListModel().create(),
			store = me.getFriendsListStore();

		rec.set('Username',username);
		//We used to set realname here, but we really want alias
		//realname doesn't even really make sense for [D]FLs.
		//Downside is failure to set realname here results in the ds
		//defaulting it to Username.
		rec.set('alias', displayName);
		rec.set('friends', friends||[]);
		rec.set('IsDynamicSharing', !!dynamic);
		rec.save({
			scope: me,
			success: function(record, operation){
				Ext.callback(callback,scope, [true, record, operation]);
				me.getListStore(username);
				Ext.defer(function(){store.add(record);}, 500);
			},
			failed: function(record, operation, response){
				if(errorCallback){
					Ext.callback(errorCallback, scope, [record, operation, response]);
				}
				else{
					Ext.callback(callback,scope, [false, response]);
				}
			}
		});
	},


	createGroupUnguarded: function(displayName, username, friends, callback, scope, error){
		this.createFriendsListUnguarded(displayName, username, friends, false, callback, error, scope);
	},


	createDFLUnguarded: function(displayName, username, friends, callback, error, scope){
		this.createFriendsListUnguarded(displayName, username, friends, true, callback, error, scope);
	},


	deleteGroup: function(record){
		if(record.get('Username') !== this.getMyContactsId()){
			record.destroy();
		}
	},


	addContact: function(username, groupList, callback){
		var store = this.getFriendsListStore(),
			contactsId = this.getMyContactsId(),
			contacts = store.findRecord('Username',contactsId,0,false,true,true),
			tracker = Globals.getAsynchronousTaskQueueForList(groupList), //why not a simple counter here
			oldContacts;

		if(isMe(username)){
			console.warn('You should not add yourself to your groups.');
			return;
		}

		function finish(){
			if(!tracker.pop()){
				Ext.callback(callback);
			}
		}

		function revertEditOnError(group, oldValue){
			return function(){
				console.warn('membership adjustment failed reverting to old value', group, oldValue, arguments);
				group.set('friends', oldValue);
			};
		}

		//TODO simplify this further
		if(!contacts.hasFriend(username) ){
			//add one just in case the contacts group is already in the list...
			if(groupList.length){
				tracker.push({});
			}
			oldContacts = contacts.get('friends').slice();
			contacts.addFriend(username).saveField('friends', undefined ,finish, revertEditOnError(contacts, oldContacts));
		}

		Ext.each(groupList,function(g) {
			var oldValue;
			if( g.get('Username') !== contactsId && !g.hasFriend(username) ){
				oldValue = g.get('friends').slice();
				g.addFriend(username).saveField('friends', undefined, finish, revertEditOnError(g, oldValue));
			}
			else {
				//skip it, we did this up front.
				finish();
			}
		});
	},


	deleteContact: function(user, groups, callback){
		var username = (user && user.isModel) ? user.get('Username') : user;
		this.removeContact(null,username, callback);
	},


	removeContact: function(record, contact, callback){
		var store = this.getFriendsListStore(),
			userId = typeof contact === 'string' ? contact : contact.get('Username'),
			count = Globals.getAsynchronousTaskQueueForList(store.getCount()); //Again with the funky task queue

		function finish(){
			if(!count.pop()){
				Ext.callback(callback);
			}
		}

		function revertEditOnError(group, oldValue){
			return function(){
				console.warn('membership adjustment failed reverting to old value', group, oldValue, arguments);
				group.set('friends', oldValue);
			};
		}

		function remove(record){
			var oldValue;
			if( record.hasFriend(userId) ){
				oldValue = record.get('friends').slice();
				record.removeFriend(userId).saveField('friends', undefined, finish, revertEditOnError(record, oldValue));
			}
			else{
				finish();
			}
		}

		if(record){
			count = Globals.getAsynchronousTaskQueueForList(1);
			remove(record);
		}
		else {
			store.each(function(g){
				//Removing a contact shouldn't remove them from dfls
				if(!g.isDFL){
					remove(g);
				}
				else{
					finish();
				}
			});
		}
	},


	fetchGroupCode: function(record, displayName, success, onError){
		var link = record.getLink('default-trivial-invitation-code');

        if(!link){
			Ext.callback(onError, this, ['Group code cannot be created for '+displayName]);
            return;
        }

        Ext.Ajax.request({
				url: link,
                scope: this,
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                callback: function(q, s, r){
                    console.log(r.responseText);
                    var result, errorText = 'An error occurred generating \'Group Code\' for '+displayName;
                    if(s){
                        result = Ext.decode(r.responseText, true);
                        result = result ? result.invitation_code : null;
                    }
                    if(!result) {
                        Ext.callback(onError, this, [errorText+' : '+r.status]);
                    }
                    else{
                        Ext.callback(success, this, [result]);
                    }
                }
		});
	},


	getGroupCode: function(record){
		var dn = record.get('displayName');
		function onSuccess(code){
			var win = Ext.widget('coderetrieval-window', {groupName: dn, code: code});
            win.show();
		}

		function onError(errorText){
			alert(errorText);
		}

		this.fetchGroupCode(record, dn, onSuccess, onError);
	},


	createGroupAndCode: function(btn){
        function handleError(errorText){
            console.error('An error occured', errorText);
            w.showError(errorText);
            btn.setDisabled(false);
        }

        function onError(record, operation, response){
			var msg = response.message,
				field = response.field,
				code = response.code;

			if(msg){
				//get the error from the error util
				if(field){
					msg = msg.replace(field,"Group Name");
				}
			}

			msg = NTIError.getError(code, {'name':'Group name'}, msg);

			if(!msg && operation.error && operation.error === 422){
				//Well a field was wrong, in this case the user only put one thing
				//in so tell him that is invalid
				msg = 'Invalid group name '+displayName;
			}

            Ext.callback(handleError, this, [msg]);
        }

        function onCreated(success, record){
            this.fetchGroupCode(record, displayName, onCodeFetched, onError);
        }

        function onCodeFetched(code){
            btn.setDisabled(false);
            w.showCreatedGroupCode(code);
        }

		var w = btn.up('window'),
			username, displayName, me=this,
			errors;

		if(!$AppConfig.service.canCreateDynamicGroups()){
			Ext.Error.raise('Permission denied.  AppUser is not allowed to create dfls');
		}

		if(btn.text === 'OK'){
			w.close();
		}
		else{
			displayName = w.getGroupName();
			username = this.generateUsername(displayName);
			console.log('Create group with name '+ displayName);
			btn.setDisabled(true);
			this.createDFLUnguarded(displayName, username, null, onCreated, onError, this);
		}
	},


	addList: function(btn){

        function handleError(errorText){
            console.error('An error occured', errorText);
            w.showError(errorText);
            btn.setDisabled(false);
        }

        function onError(record, operation, response){
			var msg = response.message,
				field = response.field,
				code = response.code;

			if(msg){
				if(field){
					msg = msg.replace(field,"List name");
				}
			}
			msg = NTIError.getError(code,{'name':'List name'},msg);
			if(!msg && operation.error && operation.error === 422){
				//Well a field was wrong, in this case the user only put one thing
				//in so tell him that is invalid
				msg = 'Invalid list name '+displayName;
			}
            Ext.callback(handleError, this, [msg]);
        }

        function onCreated(){
			w.close();
        }

		if(!$AppConfig.service.canFriend()){
			Ext.Error.raise('Permission denied.  AppUser is not allowed to create lists');
		}

		var me = this,
			w = btn.up('window'),
			displayName = w.getListName(),
			username = this.generateUsername(displayName);
		btn.setDisabled(true);
		this.createGroupUnguarded(displayName, username, null, onCreated, this, onError);
	},


	leaveGroup: function(record){
		//onSuccess instead of reloading the whole store
		//lets try and just remove the one thing we need
		function success(record){
			var store = this.getFriendsListStore(),
				idx = store.indexOfId(record.getId());

			if(idx >= 0){
				store.removeAt(idx);
			}
		}

		function onError(errorText){
			alert(errorText);
		}

		var link = record.getLink('my_membership'),
			dn = record.get('displayName');
		if(!link){
			onError('Unable to leave '+dn);
			return;
		}

		Ext.Ajax.request({
				url: link,
                scope: this,
                method: 'DELETE',
                headers: {
                    Accept: 'application/json'
                },
                callback: function(q, s, r){
                    console.log(r.responseText);
                    var result, errorText = 'An error occurred leaving  '+dn;
                    if(s){
                        result = Ext.decode(r.responseText, true);
                        result = ParseUtils.parseItems(result);
                    }
                    if(Ext.isEmpty(result)) {
                        Ext.callback(onError, this, [errorText+' : '+r.status]);
                    }
                    else{
                        Ext.callback(success, this, [result[0]]);
                    }
                }
		});
	}

});
