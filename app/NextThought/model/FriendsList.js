
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
                UserRepository.prefetchUser(p);
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
    extend: 'NextThought.model.Base',
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
        { name: 'friends', type: Ext.data.Types.USER_LIST }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsLists',
    	reader: { type: 'nti', hasContainerId: true, root: false },
    	model: 'NextThought.model.FriendsList'
    },
    getModelName: function() {
        return 'Group';
    },

    destroy: function() {
        this.set('friends', []);

        this.callParent(arguments);
    }

});