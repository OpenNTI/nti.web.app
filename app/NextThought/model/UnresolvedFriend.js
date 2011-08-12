Ext.define('NextThought.model.UnresolvedFriend', {
    extend: 'Ext.data.Model',
    // requires: ['NextThought.proxy.Rest'],
    idProperty: 'Username',
    // belongsTo: 'NextThought.model.FriendsList',
    fields: [
        { name: 'Username', type: 'string' },
        { name: 'avatarURL', type: 'string' }
    ]
});