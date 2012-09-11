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
		'account.contacts.management.Person'
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

		groups.removeAll(true);
		people.removeAll(true);

		if(store.getContacts().length === 0){
			ct.getLayout().setActiveItem( $AppConfig.service.canFriend() ? 1:2 );
			return;
		}

		ct.getLayout().setActiveItem(0);

		this.getContacts(function(friends){

			people.add({ title: 'Online', offline:true }).setUsers(friends.Online);
			people.add({ title: 'Offline', offline:true }).setUsers(friends.Offline);

			store.each(function(group){
				var id = ParseUtils.parseNtiid(group.getId()),
					list = group.get('friends'), name,
					online = [];

				if(list.length === 1 && list[0] === 'Everyone'
				&& id.specific.provider === 'zope.security.management.system_user'){
					return;
				}

				name = group.getName();

				Ext.each(list,function(n){
					var o = friends.Online[n] || friends.Offline[n];
					if(o){online.push(o);} });

				//don't associate the 'my contacts' group to the ui element...let it think its a "meta group"
				if(group.get('Username')===contactsId){
					group = null;
					//lets just not show this in the view we now have the overall view in place.
//					return;
				}

				groups.add({title: name, associatedGroup: group}).setUsers(online);
			});
		});
	},


	incomingPresenceChange: function(name, presence){
		var me = this,
			groups = Ext.getCmp('my-groups'),
			offline = groups.down('[offline]'),isContact=false;

		function groupAction(a,b,user){
			groups.items.each(function(g){
				var o = g.associatedGroup;
				if(o && Ext.Array.contains(o.get('friends'),name)){
					isContact=true;
					g[a](user);
				}
			},me);
			if(isContact){
				offline[b](user);
			}
			else {
				console.log('Ignoring presense from: '+name+', it is not in any groups');
			}
		}

		UserRepository.getUser(name, function(u) {
			var a = ['addUser','removeUser'];
			if(presence.toLowerCase()!=='online'){a.reverse();}
			groupAction(a[0],a[1],u);
		});
	},


	addGroup: function(newGroupName, callback, scope){
		var username = newGroupName
				.replace(/[^0-9A-Z\-@\+\._]/ig, '')
				+'-'+ $AppConfig.username+'_'+guidGenerator();

		this.createGroupUnguarded(newGroupName,username,[],callback,scope||this);
	},



	createGroupUnguarded: function(displayName, username, friends, callback, scope){
		var rec = this.getFriendsListModel().create(),
			store = this.getFriendsListStore();

		rec.set('Username',username);
		rec.set('realname', displayName);
		rec.set('friends', friends||[]);
		rec.save({
			scope: this,
			success: function(){
				Ext.callback(callback,scope, [true]);
				store.load();
			},
			failed: function(){
				Ext.callback(callback,scope, [false]);
			}
		});
	},


	deleteGroup: function(record){
		var store = this.getFriendsListStore();
		if(record.get('Username') !== this.getMyContactsId()){
			record.destroy({callback: function(){
				store.load();
			}});
		}
	},


	addContact: function(username, groupList){
		var store = this.getFriendsListStore(),
			contactsId = this.getMyContactsId(),
			contacts = store.findRecord('Username',contactsId,0,false,true,true),
			tracker = Globals.getAsynchronousTaskQueueForList(groupList);

		function finish(){
			if(!tracker.pop()){
				store.reload();
			}
		}

		if(!contacts.hasFriend(username) ){
			//add one just in case the contacts group is already in the list...
			if(groupList.length){
				tracker.push({});
			}
			contacts.addFriend(username).saveField('friends',null,finish);
		}
console.log(username,groupList);
		Ext.each(groupList,function(g) {
			if( g.get('Username') !== contactsId && !g.hasFriend(username) ){
				g.addFriend(username).saveField('friends',null,finish);
			}
			else {
				console.log('skipped',g);
				//skip it, we did this up front.
				finish();
			}
		});
	},


	deleteContact: function(user){
		var username = (user && user.isModel) ? user.get('Username') : user;
		this.removeContact(null,username);
	},


	removeContact: function(record, contact){
		var store = this.getFriendsListStore(),
			userId = typeof contact === 'string' ? contact : contact.get('Username'),
			count = Globals.getAsynchronousTaskQueueForList(store.getCount()),
			modified = false;

		function finish(){
			if(!count.pop() && modified){
				store.load();
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
	}
});
