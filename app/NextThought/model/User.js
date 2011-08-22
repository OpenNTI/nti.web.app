Ext.define(	'NextThought.model.User', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest',
    		'NextThought.proxy.UserSearch'
	],
    // idProperty: 'OID',
    idProperty: 'id',
    // belongsTo: 'NextThought.model.FriendsList',
    fields: [
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'id', mapping: 'ID', type: 'string' },
        { name: 'Username', type: 'string' },
        { name: 'alias', type: 'string' },
        { name: 'realname', type: 'string' },
        { name: 'avatarURL', type: 'string' }
        /*
         * ID: "jason.madden@nextthought.com"
         * Last Modified: 1313077034.687196
         * OID: "0x86"
         * Username: "jason.madden@nextthought.com"
         * alias: "jason.madden@nextthought.com"
         * avatarURL: "http://www.gravatar.com/avatar/5738739998b683ac8fe23a61c32bb5a0?s=44&d=mm"
         * realname: "Jason Madden"
         */
    ],
    proxy: {
    	type: 'usersearch',
    	model: 'NextThought.model.User'
    },
    getModelName: function() {
        return 'User';
    }
});