Ext.define('NextThought.view.widgets.chat.Friends', {
	extend:'Ext.panel.Panel',
	alias: 'widget.chat-friends-view',

	requires: [
		'NextThought.view.widgets.chat.FriendEntry',
		'NextThought.cache.IdCache'
	],

	autoScroll: true,
	layout: 'anchor',
	border: false,
	defaults: {border: false, defaults: {border: false}},

	initComponent:function() {
		this.groups = {};
		this.store = Ext.getStore('FriendsList');
		this.callParent(arguments);
		this.setGroups();
		this.store.on('load', this.setGroups, this);
	},

	setGroups: function() {
		function cleanSet(dirty, clean, obj, key){
			var k;
			obj[key] = clean;
			for(k in dirty){
				if(dirty.hasOwnProperty(k)){
					obj.remove(dirty[k]);
					delete dirty[k];
				}
			}
		}

		var me = this,
			groups = me.store,
			prevGroups = me.groups || {},
			newGroups = {};

		groups.each(function(g){
			if(/everyone/i.test(g.getId())){return;} //skip everyone group

			var gid = IdCache.getIdentifier(g.getId()),
				groupPanel = me.down('panel[groupId='+gid+']'),
				prevFriends,
				newFriends = {};

			if(!groupPanel){
				groupPanel = me.add({
					title: g.get('realname'),
					collapsible: true,
					collapseFirst: false,
					groupId: gid,
					friends: {},
					tools:[
						{
							type: 'gear',
							tooltip: 'open chat for this group',
							handler: function(){me.fireEvent('group-click', g);}
						}
					]
				});
			}

			newGroups[gid] = groupPanel;
			delete prevGroups[gid];

			prevFriends = groupPanel.friends;

			Ext.each(g.get('friends'), function(uid){
				var friend = UserRepository.getUser(uid),
					item = groupPanel.down('chat-friend-entry[userId='+uid+']');

				if(item){
					item.update(friend);
				}
				else {
					item = groupPanel.add({
						xtype: 'chat-friend-entry',
						user: friend,
						userId: uid,
						noMenu: true
					});
				}

				newFriends[uid] = item;
				delete prevFriends[uid];
			});

			cleanSet(prevFriends, newFriends, groupPanel, 'friends');

		});

		cleanSet(prevGroups, newGroups, me, 'groups');
	}
});
