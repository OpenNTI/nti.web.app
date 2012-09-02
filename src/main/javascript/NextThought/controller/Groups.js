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

		if(!coll || !coll.href){return;}

		store.proxy.url = getURL(coll.href);
		store.load();
	},



	getContacts: function(callback){
		var names = [];

		this.getFriendsListStore().each(function(g){
			names.push.apply(names,g.get('friends'));
		});

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
		var rec = this.getFriendsListModel().create(),
			store = this.getFriendsListStore();//,
			username = newGroupName
				.replace(/[^0-9A-Z\-@\+\._]/ig, '')
				+'-'+ $AppConfig.username+'_'+guidGenerator();

		rec.set('Username',username);
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

			//update user object's following:
			var uf = $AppConfig.userObject.get('following').slice();
			push.apply(uf, info.people);
			$AppConfig.userObject.set('following', uf);

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
