
Ext.data.Types.FRIEND_LIST = {
	type: 'FriendList',
    convert: function(v) {
        return !v.length || typeof(v[0])=='string'? v : UserDataLoader.parseItems(v);
    },
    sortType: function(v) {
    	console.log('sort by FriendList:',arguments);
        return '';
    }
};

/*
 * Not currently used
Ext.data.Types.USER = {
	type: 'User',
    convert: function(v) {
        return UserDataLoader.resolveUser(v);
    },
    sortType: function(v) {
    	console.log('sort by User:',arguments);
        return '';
    }
};
*/


Ext.define('NextThought.model.FriendsList', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest'
			],
    idProperty: 'OID',
    fields: [
    	{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'id', mapping: 'ID', type: 'string' },
        { name: 'OID', type: 'string' },
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
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsLists',
    	reader: { type: 'nti', hasContainerId: true, root: false },
    	model: 'NextThought.model.FriendsList'
    },
    getModelName: function() {
        return 'Group';
    }
});