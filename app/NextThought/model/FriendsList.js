Ext.require('NextThought.proxy.UserDataLoader');

Ext.data.Types.FRIEND_LIST = {
    convert: function(v) {
    	console.log('convert', arguments);
        return UserDataLoader.parseItems(v);
    },
    sortType: function(v) {
        return '';
    },
    type: 'FriendList'
};



Ext.define('NextThought.model.FriendsList', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest'
			],
    idProperty: 'OID',
    fields: [
    	{ name: 'Last Modified', type: 'date' },
        { name: 'id', mapping: 'ID', type: 'string' },
        { name: 'Creator', type: 'string' },
        { name: 'Username', type: 'string' },
        { name: 'alias', type: 'string' },
        { name: 'realname', type: 'string' },
        { name: 'avatarURL', type: 'string' },
        { name: 'ContainerId', type: 'string'},
        { name: 'friends', type: Ext.data.Types.FRIEND_LIST }
        /*
			Creator: "jonathan.grimes@nextthought.com"
			ID: "list1@nextthought.com"
			Last Modified: 1313076966.748422
			OID: "0x92"
			Username: "list1@nextthought.com"
			alias: "list1@nextthought.com"
			avatarURL: "http://www.gravatar.com/avatar/0abb472ec5334de28da57a2312b712e1?s=44&d=wavatar"
			friends: Array[3]
			realname: "List1"
		*/
    ],
    hasMany:[
    	{ model: 'NextThought.model.User', name: 'users' },
        { model: 'NextThought.model.UnresolvedFriend', name: 'unresolved' }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsLists',
    	model: 'NextThought.model.FriendsList'
    }
});