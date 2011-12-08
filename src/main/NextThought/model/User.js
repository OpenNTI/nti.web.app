Ext.define(	'NextThought.model.User', {
    extend: 'NextThought.model.Base',
    requires: [
		'NextThought.proxy.Rest'
	],
    idProperty: 'Username',

    fields: [
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
        { name: 'NotificationCount', type: 'int' },
        { name: 'id', mapping: 'ID', type: 'string' },
        { name: 'OID', type: 'string' },
        { name: 'Class', type: 'string' },
        { name: 'Username', type: 'string' },
        { name: 'Presence', type: 'string' },
        { name: 'alias', type: 'string' },
        { name: 'realname', type: 'string' },
        { name: 'avatarURL', type: 'string' },
        { name: 'accepting', type: 'UserList' },
        { name: 'ignoring', type: 'UserList' },
        { name: 'following', type: 'UserList' },
        { name: 'Communities', type: 'UserList' }
    ],
    proxy: {
		type: 'nti',
		model: 'NextThought.model.User'
    },

    constructor: function() {
        this.callParent(arguments);
        UserRepository.updateUser(this);
    },

    getModelName: function() {
        return 'User';
    }
});
