Ext.define('NextThought.model.User', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.Rest'],
    idProperty: 'OID',
    belongsTo: 'NextThought.model.Group',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'ContainerId', type: 'string'}
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsList',
    	model: 'NextThought.model.User'
    }
});