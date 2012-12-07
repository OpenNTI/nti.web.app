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
		'account.codecreation.Main'
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
				'delete-group': this.deleteGroup
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
		store.on('datachanged', this.publishContacts, this);
		store.proxy.url = getURL(coll.href);
		store.load();
	},



	getContacts: function(callback){
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
			store.each(function(g){contacts.push.apply(contacts,g.get('friends'));});
			this.createGroupUnguarded('My Contacts',id,Ext.Array.unique(contacts),finish);
		}
	},


	publishContacts: function(){
		var me = this,
			store = me.getFriendsListStore(),
			ct = Ext.getCmp('contacts-view-panel'),
			people = Ext.getCmp('contact-list'),
			groups = Ext.getCmp('my-groups'),
			contactsId = this.getMyContactsId();

		if(!groups){
			setTimeout(function(){ me.publishContacts(); },10);
			return;
		}

		console.log('Publishing contacts');

		//If there are no contacts or no friendslists other than omnipresent mycontacts group
		//hence < 2. Show the coppa or empty view
		if(store.getContacts().length === 0 && store.getCount() < 2){
			groups.removeAll(true);
			people.removeAll(true);
			ct.getLayout().setActiveItem( $AppConfig.service.canFriend() ? 1:2 );
			return;
		}

		ct.getLayout().setActiveItem(0);

		this.getContacts(function(friends){
			var componentsToAdd = [];

			console.log('Removing all sub components from groups and people');
			groups.removeAll(true);
			people.removeAll(true);

			console.log('Adding online group to people');
			people.add({ xtype: 'contacts-panel', title: 'Online', online:true }).setUsers(friends.Online);
			console.log('Adding offling group to people');
			people.add({ xtype: 'contacts-panel', title: 'Offline', offline:true }).setUsers(friends.Offline);

			store.each(function(group){
				var id = ParseUtils.parseNtiid(group.getId()),
					list = group.get('friends'), name;

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

				componentsToAdd.push({xtype: 'contacts-panel', title: name, associatedGroup: group});
			});

			groups.suspendLayout = true;

			//Add the addGroup link on the groups
			componentsToAdd.push({xtype: 'add-group'});

			var addedCmps = groups.add(componentsToAdd);
			Ext.each(addedCmps, function(cmp){
				if(cmp.setUsers && cmp.associatedGroup){
					var list = cmp.associatedGroup.get('friends'),
					online=[];
					Ext.each(list,function(n){
						var o = friends.Online[n] || friends.Offline[n];
						if(o){online.push(o);}
					});

					cmp.setUsers(online);
				}
			});

			groups.suspendLayout = false;
			groups.doLayout();
		});
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
			failed: function(record, operation){
				if(errorCallback){
					Ext.callback(errorCallback, scope, [operation]);
				}
				else{
					Ext.callback(callback,scope, [false]);
				}
			}
		});
	},

	createGroupUnguarded: function(displayName, username, friends, callback, scope){
		this.createFriendsListUnguarded(displayName, username, friends, false, callback, null, scope);
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
			store.each(remove);
		}
	},


	createGroupAndCode: function(btn){
        function handleError(errorText){
            console.error('An error occured', errorText);
            w.showError(errorText);
            btn.setDisabled(false);
        }

        function onError(record, operation){
            Ext.callback(handleError, this, ['An error occurred creating '+displayName+' : '+ operation.response.status]);
        }

        function onCreated(success, record){
            console.log(record);
            var link = record.getLink('default-trivial-invitation-code');

            if(!link){
                Ext.callback(handleError, this, ['Group code cannot be created for '+displayName]);
                return;
            }

            Ext.Ajax.request({
                url: link,
                scope: this,
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                callback: function(q, success, r){
                    console.log(r.responseText);
                    var result, errorText = 'An error occurred generating \'Group Code\' for '+displayName;
                    if(success){
                        result = Ext.decode(r.responseText, true);
                        result = result ? result.invitation_code : null;
                    }
                    if(!result) {
                        Ext.callback(handleError, this, [errorText+' : '+r.status]);
                    }
                    else{
                        Ext.callback(onCodeFetched, this, [result]);
                    }
                }
            });
        }

        function onCodeFetched(code){
            btn.setDisabled(false);
            w.showCreatedGroupCode(code);
        }

		var w = btn.up('window'),
			username, displayName;

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
	}
});
