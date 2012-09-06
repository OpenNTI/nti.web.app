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

			'add-contact-popout':{
				'add-contact': this.addContact
			},

			'contacts-management-panel': {
				'add-group': this.addGroup
			},

			'contact-card': {
				'remove-contact-from': this.removeContact
			},

			'management-group-list': {
				'add-group': this.addGroup,
				'delete-group': this.deleteGroup
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
				if(p){ friends[p][user.getId()] = user; }
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
			rec = store.findRecord('Username',id),
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
			groups = Ext.getCmp('my-groups'),
			offline;

		if(!groups){
			setTimeout(function(){ me.publishContacts(); },10);
			return;
		}

		groups.removeAll(true);
		this.getContacts(function(friends){

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
					var o = friends.Online[n];
					if(o){online.push(o);} });

				groups.add({title: name, associatedGroup: group}).setUsers(online);
			});

			offline = groups.add({ title: 'Offline', collapsed: true, offline:true });

			offline.setUsers(friends.Offline);

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

		this.createGroupUnguarded(newGroupName,username,[],callback,this);
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
				store.load();
				Ext.callback(callback,scope, [true]);
			},
			failed: function(){
				Ext.callback(callback,scope, [false]);
			}
		});
	},


	deleteGroup: function(record){
		var store = this.getFriendsListStore();
		record.destroy({callback: function(){
			store.load();
		}});
	},


	addContact: function(user, groups){

		console.log('Add Contact events hooked up, TODO: make the updates to the records, and put to the server',arguments);
	},


	removeContact: function(contactContainer, contact){
		var store = this.getFriendsListStore(),
			userId = typeof contact === 'string' ? contact : contact.getId(),
			record = contactContainer.record,
			field = contactContainer.field || 'friends',
			count = store.getCount();

		function finish(){
			count--;
			if(count<=0){ store.load(); }
		}

		function remove(record){
			var list = Ext.Array.remove(record.get(field),userId);
			record.saveField(field, list, finish);
		}

		if(record){
			count = 1;
			remove(record);
		}
		else {
			store.each(remove);
		}
	}
});
