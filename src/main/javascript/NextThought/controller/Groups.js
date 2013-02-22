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
		{ ref: 'groupsTab', selector: 'contacts-tabs-panel[source="groups"]'}
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
		store.on('load', function(){ app.finishInitializeTask(token); }, this, {single: true});
		store.on('load', this.ensureContactsGroup, this);
		store.on('datachanged', this.publishGroupsData, this);
		store.proxy.url = getURL(coll.href);
		store.load();
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
			this.createGroupUnguarded('My Contacts', id, store.getContacts(), finish);
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

			try{
				me.getContactsTab().setUsers(friends.all);
			}
			catch(e){
				console.error(Globals.getError(e));
			}

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
			groupCmps = [], listCmps = [], remaining = 0,
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
			target.push({title: name, associatedGroup: group});
		});

		//Now we need to actually add the components into the view.  we suspend layouts here
		//to cut down on work
		Ext.suspendLayouts();
		groups.removeAll(true);
		lists.removeAll(true);

		me.getGroupsTab().removeAll(true);
		me.getListsTab().removeAll(true);

		//This part is asynchronous b/c we need to resolve users
		//when we are complete we need to unsuspend and layout
		function maybeCallback(){
			if(remaining <= 0){
				Ext.resumeLayouts();
				Ext.callback(onComplete, me);
				return true;
			}
			return false;
		}

		//Add the contactpanels
		Ext.Array.push(addedCmps, me.getGroupsTab().add(Ext.clone(groupCmps)));
		Ext.Array.push(addedCmps, me.getListsTab().add(Ext.clone(listCmps)));
		Ext.Array.push(addedCmps, groups.add(groupCmps));
		Ext.Array.push(addedCmps, lists.add(listCmps));

		remaining = addedCmps.length;

		//We might be finished before we started.
		//this is the case of no groups or lists to show
		if( maybeCallback() ){
			return;
		}

		//Now for each panel figure out what users we need to add,
		//resolve them, add them, and then call finished if necessary
		Ext.each(addedCmps, function(cmp){
			var groupOrList = cmp.associatedGroup,
				usersToAdd, creator = groupOrList.get('Creator');
			if(cmp.setUsers && groupOrList){
				usersToAdd = cmp.associatedGroup.get('friends').slice();

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
					remaining--;
					maybeCallback();
				});

			}
		});
	},


	//It is unfortunate we have to synchonize this...
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
		var ct = Ext.getCmp('contacts-view-panel'),
			contacts = Ext.getCmp('contact-list') || {down:Ext.emptyFn},
			offline = contacts.down('[offline]'),
			online = contacts.down('[online]'),
			map = { offline: offline, online: online },
			cards = [], query;

		if(!online || !offline){
			//ui not ready
			return;
		}

		//We used to do a preflight check here to see if the name was a contact
		//before we made the component query.  But now since my contacts isn't
		//necessarily everyone we show cards for, it iPs not that simple.  Its not even
		//clear that was benificial.  It may be find to just constrain the component
		//query benieth the contacts-view-panel which is what we do now

		query = Ext.String.format('contact-card[username={0}],contacts-tabs-card[username={0}]',name);
		cards = Ext.Array.push(cards, Ext.ComponentQuery.query(query, ct));
		cards = Ext.Array.push(cards, Ext.ComponentQuery.query(query, Ext.getCmp('contacts')|| {down:Ext.emptyFn}));

		Ext.each(cards,
				function(u){
					var panel;
					u[/offline/i.test(presence)? 'addCls':'removeCls']('offline');
					panel = u.up('[removeUser][addUser]');
					if( panel && !(panel.is('[offline]') || panel.is('[online]'))){

						UserRepository.getUser(name, function(u) {
							panel.suspendLayouts();
							if(panel.removeUser(name)){
								panel.addUser(u);
							}
							panel.resumeLayouts(true);
						});
					}
				});

		online.suspendLayouts();
		offline.suspendLayouts();
		offline.removeUser(name);
		online.removeUser(name);

		if(this.getFriendsListStore().isContact(name)){
			UserRepository.getUser(name, function(u) {

				var panel = map[presence.toLowerCase()];
				if(panel){
					panel.addUser(u);
				}
				else {
					console.log('No panel for presence: ',presence);
				}
				online.resumeLayouts(true);
				offline.resumeLayouts(true);
			});
		}
		else{
			online.resumeLayouts(true);
			offline.resumeLayouts(true);
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
			contacts.addFriend(username).saveField('friends', undefined ,finish);
		}

		Ext.each(groupList,function(g) {
			if( g.get('Username') !== contactsId && !g.hasFriend(username) ){
				g.addFriend(username).saveField('friends', undefined ,finish);
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
				record.removeFriend(userId).saveField('friends', undefined, finish);
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
			var msg = response.message;
				field = response.field;
			if(msg){
				//Try and swizzle any field names to match what the user inputs
				if(field){
					msg = msg.replace(field, 'Group name');
				}
			}
			else{
				if(operation.error && operation.error === 422){
					//Well a field was wrong, in this case the user only put one thing
					//in so tell him that is invalid
					msg = 'Invalid group name '+displayName;
				}
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
			var msg = response.message;
				field = response.field;

			if(msg){
				//Try and swizzle any field names to match what the user inputs
				if(field){
					msg = msg.replace(field, 'List name');
				}
			}
			else{
				if(operation.error && operation.error === 422){
					//Well a field was wrong, in this case the user only put one thing
					//in so tell him that is invalid
					msg = 'Invalid list name '+displayName;
				}
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
