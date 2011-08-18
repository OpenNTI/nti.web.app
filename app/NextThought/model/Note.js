
Ext.define('NextThought.model.Note', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest',
    		'NextThought.model.FriendsList'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'xpath', type: 'string' },
        { name: 'text', type: 'string' },
        { name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'modifiedtime', type: 'string' },
       	{ name: 'Creator', type: 'string'},
       	{ name: 'ContainerId', type: 'string'},
       	{ name: 'sharedWith', type: Ext.data.Types.FRIEND_LIST }//, defaultValue: ['jonathan.grimes@nextthought.com'] }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Notes',
    	model: 'NextThought.model.Note'
    },
    getModelName: function() {
        return 'Note';
    }

});
