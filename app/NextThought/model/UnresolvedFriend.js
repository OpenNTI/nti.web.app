Ext.define('NextThought.model.UnresolvedFriend', {
    extend: 'NextThought.model.Base',
    alias: 'model.unresolved-user',
    // requires: ['NextThought.proxy.Rest'],
    idProperty: 'Username',
    // belongsTo: 'NextThought.model.FriendsList',
    fields: [
        { name: 'Username', type: 'string' },
        { name: 'avatarURL', type: 'string' }
    ],
    getModelName: function() {
        return 'Unresolved Friend';
    }
});