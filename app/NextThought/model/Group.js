Ext.define('NextThought.model.Group', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.NTIRest'],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'name', type: 'string' }
    ],
    associations: [
        {type: 'hasMany', model: 'NextThought.model.Person', name: 'people'}
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'FriendsList',
    	model: 'NextThought.model.Group'
    }
});