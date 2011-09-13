
Ext.data.Types.FRIEND_LIST = {
	type: 'FriendList',
    convert: function(v) {
        var u = [];

        Ext.each(v, function(o){
            //these two branches result in a string being in the array. everything that uses this Type expects a model
            //DEPRECATED:
            if(typeof(o)=='string'){
                console.log('WARNING:was string, keeping a string');
                u.push(o);
            }
            //DEPRECATED:
            else if(o.get){
                console.log('WARNING:was model, converting to a string');
                u.push(o.get('Username'));
            }
            //Preferred branch:
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


Ext.data.Types.USER_LIST = {
	type: 'UserList',
    convert: function(v) {
        var a = arguments,
            u = [];

        if(v) Ext.each(v, function(o){
            var p =
                typeof(o)=='string'
                    ? o
                    : o.get
                        ? o.get('Username')
                        : o.Username
                            ? o.Username
                            : null;
            if(!p)
                console.log("WARNING: Could not handle Object: ", o, a);
            else  {
                u.push(p);
                //asynchronously resolve this user so its cached and ready
                UserDataLoader.resolveUser(p,function(){});
            }
        });

        return u;
    },
    sortType: function(v) {
    	console.log('sort by UserList:',arguments);
        return '';
    }
};


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
        { name: 'Class', type: 'string' },
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