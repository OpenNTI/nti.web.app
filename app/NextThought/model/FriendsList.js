
Ext.data.Types.FRIEND_LIST = {
	type: 'FriendList',
    convert: function(v) {
        var u = [];

        Ext.each(v, function(o){

            if(typeof(o)=='string')
                u.push(o);
            else if(o.get)
                u.push(o.get('Username'));
            else if(o.Username)
                u.push(UserDataLoader.parseItems([o])[0]);
            else
                console.log("WARNING: Could not handle Object: ", o, arguments);

        });

        return u;
    },
    sortType: function(v) {
    	console.log('sort by FriendList:',arguments);
        return '';
    }
};


Ext.data.Types.SHARED_WITH = {
	type: 'SharedWith',
    convert: function(v) {
        var u = [];

        Ext.each(v, function(o){
            var p =
                typeof(o)=='string'
                    ? o
                    : o.get
                        ? o.get('Username')
                        : o.Username
                            ? o.Username
                            : null;
            if(!p)
                console.log("WARNING: Could not handle Object: ", o, arguments);
            else  {
                u.push(p);
                //asynchronously resolve this user so its cached and ready
                UserDataLoader.resolveUser(p,function(){});
            }
        });

        return u;
    },
    sortType: function(v) {
    	console.log('sort by SharedWith:',arguments);
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