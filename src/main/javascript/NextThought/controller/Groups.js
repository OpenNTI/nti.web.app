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


	refs: [
		{ ref: 'contactsTab', selector: 'contacts-tabs-panel[source="contacts"]'},
		{ ref: 'followingTab', selector: 'contacts-tabs-panel[source="following"]'},
		{ ref: 'listsTab', selector: 'contacts-tabs-panel[source="lists"]'},
		{ ref: 'groupsTab', selector: 'contacts-tabs-panel[source="groups"]'},
		{ ref: 'accountListsTab', selector: '#my-lists'},
		{ ref: 'accountGroupsTab', selector: '#my-groups'}
	],


	MY_CONTACTS_PREFIX_PATTERN: 'mycontacts-{0}',


	init: function() {
		this.application.on('session-ready', this.onSessionReady, this);

		this.control({

			'contact-popout':{
				'add-contact': this.addContact,
				'delete-contact': this.deleteContact
			},

			'contacts-panel':{
				'delete-group': this.deleteGroup,
				'get-group-code': this.getGroupCode,
				'leave-group': this.leaveGroup,
				'remove-contact': this.removeContact
			},

			'contacts-tabs-grouping':{
				'delete-group': this.deleteGroup,
				'get-group-code': this.getGroupCode,
				'leave-group': this.leaveGroup,
				'remove-contact': this.removeContact
			},

			'management-group-list': {
				'add-group': this.addGroup,
				'delete-group': this.deleteGroup,
				'add-contact': this.addContact,
				'remove-contact': this.removeContact
			},

			'add-group' : {
				'add-group': this.addGroup
			},

			'codecreation-main-view button[name=submit]': {
				'click': this.createGroupAndCode
			},

			'createlist-main-view button[name=submit]' : {
				'click': this.addList
			},

			'#contact-list contact-card': {
				'presence-changed': this.presenceOfContactChanged
			}

		},{});
	},


	onSessionReady: function(){
		var app = this.application,
			store = this.getFriendsListStore(),
			mime = (new store.model()).mimeType,
			coll = $AppConfig.service.getCollectionFor(mime,'FriendsLists'),
			token = {};

		if(!coll || !coll.href){return;}

		app.registerInitializeTask(token);
		store.on('load', function(){ app.finishInitializeTask(token); }, this, {single: true});
		store.on('load', this.ensureContactsGroup, this);
		store.on('contacts-changed', this.publishContacts, this);
		store.on({
			scope: this,
			'contacts-changed': this.publishContacts,
			'contacts-added': this.contactsAdded,
			'contacts-removed': this.contactsRemoved,
			load: this.friendsListsLoaded,
			add: this.friendsListsAdded,
			remove: this.friendsListRemoved //We really want bulkremove here, but that doesn't look implemented in the version of ext we have
		});
		store.proxy.url = getURL(coll.href);
		store.load();
	},


	getGroupContainers: function(){
		return [this.getGroupsTab(), this.getAccountGroupsTab()];
	},


	getListContainers: function(){
		return [this.getListsTab(), this.getAccountListsTab()];
	},


	getResolvedContacts: function(callback){
		var names = this.getFriendsListStore().getContacts(),
			following = this.getFollowingTab();

		names = Ext.Array.sort(Ext.Array.unique(names));

//		UserRepository.getUser($AppConfig.userObject.get('following'),function(users){
//			following.removeAll(true);
//			following.add( Ext.Array.map(users,function(i){return {record: i};}) );
//		});

		UserRepository.getUser(names,function(users){
			var friends = {Online: {}, Offline: {}, all:[]},
				all = {};
			Ext.each(users,function(user){
				var p = user.get('Presence'),
					n = user.get('Username');

				if(p){ friends[p][n] = user; }

				all[n] = user;
			});

			Ext.Object.each(all,function(n,u){ friends.all.push(u); });

			Ext.callback(callback,null,[friends]);
		});
	},


	getMyContactsId: function(){
		if(!this.myContactsId){
			this.myContactsId = Ext.String.format(this.MY_CONTACTS_PREFIX_PATTERN,$AppConfig.username);
		}
		return this.myContactsId;
	},


	ensureContactsGroup: function(){
		var store = this.getFriendsListStore(),
			id = this.getMyContactsId(),
			rec = store.findRecord('Username',id,0,false,true,true),
			contacts = [];

		if(!rec){
			this.createGroupUnguarded('My Contacts', id, store.getContacts());
		}
	},


	maybePublishContacts: function(contactList){
		if(this.publishingContacts){
			console.log('Defering contacts publication');
			this.contactsNeedRepublished = true;
			return false;
		}

		this.publishingContacts = true;
		this.contactsNeedRepublished = false;
		console.log('publishing contacts');
		this.doPublishContacts(contactList, function(){
			console.log('contact publication complete');
			this.publishingContacts = false;
			if(this.contactsNeedRepublished){
				console.log('Will republish contacts');
				this.maybePublishContacts(contactList);
			}
		});
		return true;
	},


	doPublishContacts: function(contactList, onComplete){
		var me = this;
		this.getResolvedContacts(function(friends){

			try{
				me.getContactsTab().setUsers(friends.all);
			}
			catch(e){
				console.error(Globals.getError(e));
			}

			console.log('Removing all sub components for contactlist');
			contactList.removeAll(true);

			console.log('Adding online group to people');
			contactList.add({ xtype: 'contacts-panel',
							  title: 'Online', online :true,
							  reactToChildPresenceChanged: false,
							  reactToModelChanges: false}).setUsers(friends.Online);
			console.log('Adding offling group to people');
			contactList.add({ xtype: 'contacts-panel',
							  title: 'Offline',
							  offline: true,
							  reactToChildPresenceChanged: false,
							  reactToModelChanges: false}).setUsers(friends.Offline);
			Ext.callback(onComplete, me);
		});
	},


	isPresentableFriendsList: function(fl){
		var list, id;

		if(fl.get('Username') === this.getMyContactsId()){
			return false;
		}

		//TODO still need to do this everyone check
		list = fl.get('friends');
		if(list.length === 1 && list[0] === 'Everyone'){
			id = ParseUtils.parseNtiid(fl.getId());
			if(id.specific.provider === 'system'){
				return false;
			}
		}

		return true;
	},


	cmpConfigForRecord: function(rec){
		return {title: rec.getName(), associatedGroup: rec};
	},


	friendsListsAdded: function(store, records){
		var me = this;

		console.log('FLs added', arguments);

		Ext.Array.each(records, function(rec){
			var containers, idx, i=0;
			if(!this.isPresentableFriendsList(rec)){
				return; //keep going
			}

			containers = rec.isDFL ? this.getGroupContainers() : this.getListContainers();

			Ext.Array.each(containers, function(container){
				var displayedRecords = Ext.Array.pluck(container.query('[associatedGroup]'), 'associatedGroup'),
					collection = new Ext.util.MixedCollection(),
					idx = 0;
				//We create a mixed collection of the cmps records
				//and find the insertion location using the stores
				//comparator
				collection.addAll(displayedRecords);
				idx = collection.findInsertionIndex(rec, store.generateComparator());

				container.insert(idx, me.cmpConfigForRecord(rec));
			});

		}, this);
	},


	friendsListRemoved: function(store, record){
		var containers = record.isDFL ? this.getGroupContainers() : this.getListContainers();
		console.log('FL removed', arguments);

		Ext.Array.each(containers, function(container){
			Ext.Array.each(container.query('[associatedGroup]'), function(c){
				if(c.associatedGroup === record){
					c.destroy();
				}
			});
		});
	},


	friendsListsLoaded: function(store, records, successful){
		var groupsToAdd = [], listsToAdd = [], me = this;

		if(!successful){
			console.warn('Friends list load callback was unsuccesful', arguments);
			return;
		}
		console.log('FLs loaded', arguments);

		store.each(function(rec){
			var target;

			if(!this.isPresentableFriendsList(rec)){
				return; //keep going
			}

			target = rec.isDFL ? groupsToAdd : listsToAdd;
			target.push(rec);
		}, this);


		function addRecordsToContainers(containers, records){
			Ext.Array.each(containers, function(container){
				container.removeAll(true);
				container.add(Ext.Array.map(records, function(r){
					return me.cmpConfigForRecord(r);
				}));
			});
		}

		//OK now create cmps and add them to the containers that care about them
		addRecordsToContainers(this.getGroupContainers(), groupsToAdd);
		addRecordsToContainers(this.getListContainers(), listsToAdd);
	},


	//It is unfortunate we have to synchonize this...
	publishContacts: function(){
		var me = this,
			store = me.getFriendsListStore(),
			ct = Ext.getCmp('contacts-view-panel'),
			people = Ext.getCmp('contact-list');

		//TODO figure out how to use an event here and get rid of the
		//bloody setTimout
		if(!people){
			setTimeout(function(){ me.publishContacts(); },10);
			return;
		}

		//If there are no contacts or no friendslists other than omnipresent mycontacts group
		//hence < 2. Show the coppa or empty view
		if(store.getContacts().length === 0 && store.getCount() < 2){
			ct.getLayout().setActiveItem( $AppConfig.service.canFriend() ? 1:2 );
			return;
		}

		ct.getLayout().setActiveItem(0);

		this.maybePublishContacts(people);
	},


	contactsAdded: function(newContacts){
		var me = this;
		//TODO this needs to go away. We end up doing extra work when
		//we get into this condition (its rare and timing related...)
		if(this.publishingContacts){
			this.maybePublishContacts();
			return;
		}

		UserRepository.getUser(newContacts, function(users){
			var contacts = Ext.getCmp('contact-list') || {down:Ext.emptyFn},
				offline = contacts.down('[offline]'),
				online = contacts.down('[online]'),
				map = { offline: offline, online: online },
				contactsTab = me.getContactsTab(),
				containers = [offline, online, contactsTab];

				Ext.Array.each(containers, function(c){
					c.suspendLayouts();
				});

				Ext.Array.each(users, function(user){
					var presence = user.get('Presence'),
						panel = map[presence.toLowerCase()];
					contactsTab.addUser(user);
					panel.addUser(user);
				});

				Ext.Array.each(containers, function(c){
					c.resumeLayouts(true);
				});
		});
	},


	contactsRemoved: function(oldContacts){
		//TODO this needs to go away. We end up doing extra work when
		//we get into this condition (its rare and timing related...)
		if(this.publishingContacts){
			this.maybePublishContacts();
			return;
		}

		var contacts = Ext.getCmp('contact-list') || {down:Ext.emptyFn},
			offline = contacts.down('[offline]'),
			online = contacts.down('[online]'),
			containers = [offline, online, this.getContactsTab()];

		Ext.Array.each(containers, function(c){
			c.suspendLayouts();

			Ext.Array.each(oldContacts, function(contact){
				try{
					c.removeUser(contact);
				}
				catch(e){
					console.log('An error occured removing contact from container', contact, c, Globals.getError(e));
				}
			});

			c.resumeLayouts(true);
		});

	},


	presenceOfContactChanged: function(cmp){
		var contacts = Ext.getCmp('contact-list') || {down:Ext.emptyFn},
			offline = contacts.down('[offline]'),
			online = contacts.down('[online]'),
			map = { offline: offline, online: online },
			presence = cmp.getUserObject().get('Presence'),
			panel = map[presence.toLowerCase()];

		if(panel){
			if(panel !== cmp.ownerCt){
				cmp.ownerCt.remove(cmp, false);
				panel.addCmpInSortedPosition(cmp);
			}
		}
		else {
			console.log('No panel for presence: ',presence);
		}
	},


	generateUsername: function(newGroupName){
		var username = newGroupName
				.replace(/[^0-9A-Z\-@\+\._]/ig, '')
				+'-'+ $AppConfig.username+'_'+guidGenerator();

		return username;
	},


	addGroup: function(newGroupName, friends, callback, scope){
		var username = this.generateUsername(newGroupName);

		this.createGroupUnguarded(newGroupName,username,friends||[],callback,scope||this);
	},


	createFriendsListUnguarded: function(displayName, username, friends, dynamic, callback, errorCallback, scope){
		var rec = this.getFriendsListModel().create(),
			store = this.getFriendsListStore();

		rec.set('Username',username);
		//We used to set realname here, but we really want alias
		//realname doesn't even really make sense for [D]FLs.
		//Downside is failure to set realname here results in the ds
		//defaulting it to Username.
		rec.set('alias', displayName);
		rec.set('friends', friends||[]);
		rec.set('IsDynamicSharing', !!dynamic);
		rec.save({
			scope: this,
			success: function(record, operation){
				Ext.callback(callback,scope, [true, record, operation]);
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
		var store = this.getFriendsListStore(),
            name = record.get('Username');

		if(name !== this.getMyContactsId()){
			record.destroy();
		}
	},


	addContact: function(username, groupList, callback){
		var store = this.getFriendsListStore(),
			contactsId = this.getMyContactsId(),
			contacts = store.findRecord('Username',contactsId,0,false,true,true),
			tracker = Globals.getAsynchronousTaskQueueForList(groupList), //why not a simple counter here
			oldContacts;

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
