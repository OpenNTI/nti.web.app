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
		'account.contacts.management.GroupList',
		'account.contacts.management.Person',
		'account.contacts.management.AddGroup',
		'account.codecreation.Main',
		'account.contacts.createlist.Main'
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
			}

		},{});

		//Listen for changes of presence to notify the online/offline lists
		var me = this;
		Socket.register({
			'chat_presenceOfUserChangedTo': function(){me.incomingPresenceChange.apply(me, arguments);}
		});
	},


	onSessionReady: function(){
		var app = this.application,
			store = this.getFriendsListStore(),
			mime = (new store.model()).mimeType,
			coll = $AppConfig.service.getCollectionFor(mime,'FriendsLists'),
			token = {};

		if(!coll || !coll.href){return;}

		app.registerInitializeTask(token);
		store.on('load', function(s){ app.finishInitializeTask(token); }, this, {single: true});
		store.on('load', this.ensureContactsGroup, this);
		store.on('datachanged', this.publishGroupsData, this);
		store.proxy.url = getURL(coll.href);
		store.load();
	},



	getResolvedContacts: function(callback){
		var names = this.getFriendsListStore().getContacts();

		names = Ext.Array.sort(Ext.Array.unique(names));

		UserRepository.getUser(names,function(users){
			var friends = {Online: {}, Offline: {}};
			Ext.each(users,function(user){
				var p = user.get('Presence');
				if(p){ friends[p][user.get('Username')] = user; }
			});

			Ext.callback(callback,null,[friends]);
		});
	},


	getMyContactsId: function(){
		return Ext.String.format(this.MY_CONTACTS_PREFIX_PATTERN,$AppConfig.username);
	},


	ensureContactsGroup: function(){
		var store = this.getFriendsListStore(),
			id = this.getMyContactsId(),
			rec = store.findRecord('Username',id,0,false,true,true),
			contacts = [];

		//TODO why reload here, createGroupUnguarded does a load
		function finish(){
			store.reload();
		}

		if(!rec){
			store.each(function(g){
				//if(!g.isDFL){
					contacts.push.apply(contacts,g.get('friends'));
				//}
			});
			this.createGroupUnguarded('My Contacts',id,Ext.Array.unique(contacts),finish);
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
		this.publishContacts(contactList, function(){
			console.log('contact publication complete');
			this.publishingContacts = false;
			if(this.contactsNeedRepublished){
				console.log('Will republish contacts');
				this.maybePublishContacts(contactList);
			}
		});
		return true;
	},

	publishContacts: function(contactList, onComplete){
		var me = this;
		this.getResolvedContacts(function(friends){
			console.log('Removing all sub components for contactlist');
			contactList.removeAll(true);

			console.log('Adding online group to people');
			contactList.add({ xtype: 'contacts-panel', title: 'Online', online:true }).setUsers(friends.Online);
			console.log('Adding offling group to people');
			contactList.add({ xtype: 'contacts-panel', title: 'Offline', offline:true }).setUsers(friends.Offline);
			Ext.callback(onComplete, me);
		});
	},

	maybePublishGroupsAndLists: function(groups, lists){
		if(this.publishingGroups){
			console.log('Deferring groups publication');
			this.groupsNeedRepublished = true;
			return false;
		}

		this.publishingGroups = true;
		this.groupsNeedRepublished = false;
		console.log('Publishing groups');
		this.publishGroupsAndLists(groups, lists, function(){
			console.log('group publication complete');
			this.publishingGroups = false;
			if(this.groupsNeedRepublished){
				console.log('Will republish groups');
				this.maybePublishGroupsAndLists(groups, lists);
			}
		});
		return true;
	},

	publishGroupsAndLists: function(groups, lists, onComplete){
		var store = this.getFriendsListStore(), me = this,
			groupCmps = [], listCmps = [], remainingGroups, remainingLists,
			addedCmps = [], contactsId = this.getMyContactsId();

		//First we build up a list of the group and list cmps
		//that will be added (these are the sections that can be collapsed)
		store.each(function(group){
			var id = ParseUtils.parseNtiid(group.getId()),
				list = group.get('friends'), name, target;

			if(list.length === 1 && list[0] === 'Everyone'
				&& id.specific.provider === 'zope.security.management.system_user'){
				return;
			}

			name = group.getName();

			//don't associate the 'my contacts' group to the ui element...let it think its a "meta group"
			if(group.get('Username')===contactsId){
				group = null;
				//lets just not show this in the view we now have the overall view in place.
				return;
			}
			target = group.isDFL ? groupCmps : listCmps;
			target.push({xtype: 'contacts-panel', title: name, associatedGroup: group});
		});

		//Now we need to actually add the components into the view.  we suspend layouts here
		//to cut down on work
		groups.removeAll(true);
		lists.removeAll(true);

		groups.suspendLayouts();
		lists.suspendLayouts();;

		//This part is asynchronous b/c we need to resolve users
		//when we are complete we need to unsuspend and layout
		function maybeCallback(){
			if(remainingLists === 0  && remainingGroups === 0){
				Ext.callback(onComplete, me);
			}
		}

		function groupsFinished(){
			groups.resumeLayouts(true);
			maybeCallback();
		}

		function listsFinished(){
			lists.resumeLayouts(true);
			maybeCallback();
		}

		//Add the contactpanels
		Ext.Array.push(addedCmps, groups.add(groupCmps));
		Ext.Array.push(addedCmps, lists.add(listCmps));

		remainingLists = listCmps.length;
		remainingGroups = groupCmps.length;

		//Now for each panel figure out what users we need to add,
		//resolve them, add them, and then call finished if necessary
		Ext.each(addedCmps, function(cmp){
			var groupOrList = cmp.associatedGroup,
				usersToAdd, creator = groupOrList.get('Creator');
			if(cmp.setUsers && groupOrList){
				usersToAdd = cmp.associatedGroup.get('friends');

				//We want dfls owners to look like members, even though they arent.
				//but make sure if we own it we don't look like a member
				if(groupOrList.isDFL && !isMe(creator)){
					usersToAdd.push(creator);
				}

				//Now with dfls there are cases where the friends array may
				//contain the appuser.  Make sure we strip that out
				Ext.Array.remove(usersToAdd, $AppConfig.username);

				UserRepository.getUser(usersToAdd, function(resolvedUsers){
					cmp.setUsers(resolvedUsers);
					if(groupOrList.isDFL){
						remainingGroups--;
						if(remainingGroups === 0){
							groupsFinished();
						}
					}
					else{
						remainingLists--;
						if(remainingLists === 0){
							listsFinished();
						}
					}
				});

			}
		});
	},

	publishGroupsData: function(){
		var me = this,
			store = me.getFriendsListStore(),
			ct = Ext.getCmp('contacts-view-panel'),
			people = Ext.getCmp('contact-list'),
			lists = Ext.getCmp('my-lists'),
			groups = Ext.getCmp('my-groups');

		if(!groups){
			setTimeout(function(){ me.publishGroupsData(); },10);
			return;
		}

		//If there are no contacts or no friendslists other than omnipresent mycontacts group
		//hence < 2. Show the coppa or empty view
		if(store.getContacts().length === 0 && store.getCount() < 2){
			groups.removeAll(true);
			people.removeAll(true);
			lists.removeAll(true);
			ct.getLayout().setActiveItem( $AppConfig.service.canFriend() ? 1:2 );
			return;
		}

		ct.getLayout().setActiveItem(0);

		this.maybePublishContacts(people);
		this.maybePublishGroupsAndLists(groups, lists);
	},


	incomingPresenceChange: function(name, presence){
		var contacts = Ext.getCmp('contact-list') || {down:Ext.emptyFn},
			offline = contacts.down('[offline]'),
			online = contacts.down('[online]'),
			map = { offline: offline, online: online };

		if(!online || !offline){
			//ui not ready
			return;
		}

		if(!Ext.Array.contains(this.getFriendsListStore().getContacts(),name)){
			console.log('Ignoring presense from: '+name+', it is not in any groups');
			return;
		}


		Ext.each(
				Ext.ComponentQuery.query(Ext.String.format('contact-card[username={0}]',name)),
				function(u){
					u[/offline/i.test(presence)? 'addCls':'removeCls']('offline');
				});

		offline.removeUser(name);
		online.removeUser(name);

		UserRepository.getUser(name, function(u) {

			var panel = map[presence.toLowerCase()];
			if(panel){
				panel.addUser(u);
			}
			else {
				console.log('No panel for presence: ',presence);
			}
		});
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
		rec.set('realname', displayName);
		rec.set('friends', friends||[]);
		rec.set('IsDynamicSharing', !!dynamic);
		rec.save({
			scope: this,
			success: function(record, operation){
				Ext.callback(callback,scope, [true, record, operation]);
				store.load();
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
			record.destroy({callback: function(){
				store.load();
			}});
		}
	},


	addContact: function(username, groupList, callback){
		var store = this.getFriendsListStore(),
			contactsId = this.getMyContactsId(),
			contacts = store.findRecord('Username',contactsId,0,false,true,true),
			tracker = Globals.getAsynchronousTaskQueueForList(groupList);

		function finish(){
			if(!tracker.pop()){
				store.reload();
			}

			if(callback){
				Ext.callback(callback);
			}
		}

		if(!contacts.hasFriend(username) ){
			//add one just in case the contacts group is already in the list...
			if(groupList.length){
				tracker.push({});
			}
			contacts.addFriend(username).saveField('friends',null,finish);
		}

		Ext.each(groupList,function(g) {
			if( g.get('Username') !== contactsId && !g.hasFriend(username) ){
				g.addFriend(username).saveField('friends',null,finish);
			}
			else {
				//skip it, we did this up front.
				finish();
			}
		});
	},


	deleteContact: function(user, groups,callback){
		var username = (user && user.isModel) ? user.get('Username') : user;
		this.removeContact(null,username, callback);
	},


	removeContact: function(record, contact, callback){
		var store = this.getFriendsListStore(),
			userId = typeof contact === 'string' ? contact : contact.get('Username'),
			count = Globals.getAsynchronousTaskQueueForList(store.getCount()),
			modified = false;

		function finish(){
			if(!count.pop() && modified){
				store.reload();
			}

			if(callback){
				Ext.callback(callback);
			}
		}

		function remove(record){
			if( record.hasFriend(userId) ){
				modified = true;
				record.removeFriend(userId).saveField('friends',null,finish);
			} else {
				finish();
			}
		}

		if(record){
			count = Globals.getAsynchronousTaskQueueForList(1);
			remove(record);
		}
		else {
			store.each(function(g){
				//if(!g.isDFL){
					remove(g);
				//}
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
			var win = Ext.create('NextThought.view.account.coderetrieval.Window', {groupName: dn, code: code});
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
			var code = response.code,
				msg = errors[code] || errors['_default'];
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
			errors = {
				'RealnameInvalid': 'Invalid group name '+displayName
			};
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
			var code = response.code,
				msg = errors[code] || errors['_default'];
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
			username = this.generateUsername(displayName),
			errors = {
				'RealnameInvalid': 'Invalid list name '+displayName
			};
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
			else{
				console.warn('Falling back to expensive reload');
				store.reload();
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
