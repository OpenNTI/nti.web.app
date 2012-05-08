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
		'account.GroupEditor'
	],

	init: function() {
		this.application.on('session-ready', this.onSessionReady, this);

		this.control({},{});

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
		store.on('load', this.publishFriends, this);
		store.proxy.url = $AppConfig.server.host+coll.href;
		store.load();
	},


	publishFriends: function(){
		var store = this.getFriendsListStore(),
			groups = Ext.getCmp('my-groups');

		store.getFriends(function(friends){
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
			UserRepository.prefetchUser(friends,function(users){
				groups.add({title: name}).setUsers(users);
			});
		});

	},


//	groupEditorButtonClicked: function(btn){
//		var win = btn.up('window'),
//			frm = win.down('form'),
//			str = win.store,
//			rec = win.record,
//			names = [],
//			values, n;
//
//
//		if(btn.actionName === 'save') {
//			if(!frm.getForm().isValid()){
//				return;
//			}
//
//			win.el.mask('Saving...');
//			values = frm.getValues();
//			Ext.each(str.data.items, function(u){ names.push(u.get('Username')); });
//
//			if(rec.phantom){
//				n = values.name;
//				n = n.replace(/[^0-9A-Za-z\-@]/g, '.');
//				n = n.replace(/^[\.\-_]+/g, '');
//				rec.set('Username',n+'@nextthought.com');
//			}
//			rec.set('realname', values.name);
//			rec.set('friends', names);
//			rec.save({
//				scope: this,
//				success: function(){
//					this.reloadGroups();
//					win.close();
//				},
//				failed: function(){
//					win.el.unmask();
//				}
//			});
//			return;
//		}
//
//		win.close();
//	},

	incomingPresenceChange: function(name, presence){
		var offline = Ext.getCmp('offline-contacts'),
			online = Ext.getCmp('online-contacts'),
			u;

		UserRepository.prefetchUser(name, function(users) {
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
	}

});
