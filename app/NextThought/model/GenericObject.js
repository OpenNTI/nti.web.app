
Ext.define('NextThought.model.GenericObject', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest',
    		'NextThought.model.FriendsList'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
       	{ name: 'Creator', type: 'string'},
        { name: 'Class', type: 'string' },
       	{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
       	{ name: 'ContainerId', type: 'string'},
        { name: 'text', type: 'string' },
       	{ name: 'sharedWith', type: Ext.data.Types.FRIEND_LIST }
    ]
});
