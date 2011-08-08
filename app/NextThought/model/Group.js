Ext.define('NextThought.model.Group', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.Rest'],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'ContainerId', type: 'string'}
    ],
    associations: [
        {type: 'hasMany', model: 'NextThought.model.User', name: 'people'}
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsList',
    	model: 'NextThought.model.Group'
    }
});