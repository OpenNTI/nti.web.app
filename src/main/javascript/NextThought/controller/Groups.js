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
		'account.contacts.management.Panel'
	],

	init: function() {
		this.application.on('session-ready', this.onSessionReady, this);

		this.control({

			'contacts-management-panel button[action=cancel]': {
				'click': this.cancelGroupAdditions
			},
			'contacts-management-panel button[action=finish]': {
				'click': this.saveGroupAdditions
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

		app.registerInitializeTask(token);
		store.on('load', function(s){ app.finishInitializeTask(token); }, this, {single: true});

		store.on('datachanged', this.publishContacts, this);

		store.proxy.url = getURL(coll.href);
		store.load();
	},



	getContacts: function(user,callback){
		var names = user.get('following') || [];

		UserRepository.getUser(names,function(u){
			var friends = {Online: {}, Offline: {}};
			Ext.each(u,function(user){
				var p = user.get('Presence');
				if(p){ friends[p][user.getId()] = user; }
			});

			Ext.callback(callback,null,[friends]);
		});
	},



	publishContacts: function(){
		var me = this,
			user = $AppConfig.userObject,
			store = me.getFriendsListStore(),
			groups = Ext.getCmp('my-groups');

		if(!groups){
			setTimeout(function(){ me.publishContacts(); },10);
			return;
		}

		this.getContacts(user,function(friends){
			Ext.getCmp('offline-contacts').setUsers(friends.Offline);
			Ext.getCmp('online-contacts').setUsers(friends.Online);
		});

		groups.removeAll(true);

		store.each(function(group){
			var id = ParseUtils.parseNtiid(group.getId()),
				friends = group.get('friends');

			if(friends.length === 1 && friends[0] === 'Everyone'
			&& id.specific.provider === 'zope.security.management.system_user'){
				return;
			}

			var name = group.getName();
			UserRepository.getUser(friends,function(users){
				groups.add({title: name, associatedGroup: group}).setUsers(users);
			});
		});

	},


	incomingPresenceChange: function(name, presence){
		var offline = Ext.getCmp('offline-contacts'),
			online = Ext.getCmp('online-contacts'),
			u;

		UserRepository.getUser(name, function(users) {
			u = users[0];
			if (presence.toLowerCase()==='online') {
				//remove from offline, add to online
				online.addUser(u);
				offline.removeUser(u);
			}
			else if (presence.toLowerCase()==='offline') {
				online.removeUser(u);
				offline.addUser(u);
			}
			else {
				console.error('Got a weird presence notification.', name, presence);
			}
		});
	},


	addGroup: function(newGroupName, callback, scope){
		var rec = this.getFriendsListModel().create(),
			store = this.getFriendsListStore(),
			username = newGroupName
				.replace(/[^0-9A-Za-z\-@]/g, '.')
				.replace(/^[\.\-_]+/g, '');

		if(!Globals.INVALID_CHARACTERS_PATTERN.test(newGroupName)){
			return Ext.callback(callback,scope, [false]);
		}

		rec.set('Username',username+'@nextthought.com');

		rec.set('realname', newGroupName);
		rec.set('friends', []);
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


	cancelGroupAdditions: function(btn){
		btn.up('contacts-management-panel').reset();
	},


	saveGroupAdditions: function(btn){
		var store = this.getFriendsListStore(),
			panel = btn.up('contacts-management-panel'),
			data = panel.getData(),
			active = Globals.getAsynchronousTaskQueueForList(Object.keys(data)),
			push = Array.prototype.push,
			hasErrors = false,
			failedGroups = [];

		function complete(){
			panel.getEl().unmask();

			if( !hasErrors ){
				panel.reset();
				store.load();
			}
			else {
				//tell the panel which groups failed
				console.log('some failures');
			}
		}

		//only mask if there's work to do...
		if(Object.keys(data).length > 0) {
			panel.getEl().mask();
		}

		Ext.Object.each(data,function(key,info){

			var record = info.record,
				field = 'friends',
				list;

			if(record.isEveryone()){
				record = $AppConfig.userObject;
				field = 'following';
			}

			list = record.get(field).slice();//clone list
			push.apply(list, info.people); //add users
			record.set(field, list); //reassign the list back

			record.save({
				callback: function(newRecord,operation){
					var failed = !operation || !operation.success;

					hasErrors = hasErrors || failed;
					if(failed){
						failedGroups.push(record);
					}

					active.pop();
					if(active.length===0){
						complete();
					}
				}
			});
		});
	},

	removeContact: function(contactContainer, contact){
		var store = this.getFriendsListStore();
		var userId = typeof contact === 'string' ? contact : contact.getId();
		var record = contactContainer.record;
		var field = contactContainer.field;
		var list = record.get(field);

		list = Ext.Array.remove(list,userId);

		record.saveField(field, list, function() {
			store.load();
		});
	}
});
