Ext.define(	'NextThought.model.User', {
    extend: 'NextThought.model.Base',
    idProperty: 'Username',
    fields: [
        { name: 'lastLoginTime', type: 'date', dateFormat: 'timestamp' },
        { name: 'NotificationCount', type: 'int' },
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

    constructor: function() {
        this.callParent(arguments);
        UserRepository.updateUser(this);
    }
});
