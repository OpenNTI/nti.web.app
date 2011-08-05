Ext.define('NextThought.model.Person', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.NTIRest'],
    idProperty: 'OID',
    belongsTo: 'NextThought.model.Group',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'name', type: 'string' }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsList',
    	model: 'NextThought.model.Person'
    }
});