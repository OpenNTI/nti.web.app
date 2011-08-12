
Ext.define('NextThought.model.Highlight', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest',
    		'NextThought.model.FriendsList'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'startXpath', type: 'string' },
        { name: 'startOffset', type: 'int' },
     	{ name: 'endXpath', type: 'string' },
       	{ name: 'endOffset', type: 'int' },
       	{ name: 'Creator', type: 'string'},
       	{ name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'modifiedtime', type: 'string' },
       	{ name: 'ContainerId', type: 'string'},
       	{ name: 'sharedWith', type: Ext.data.Types.FRIEND_LIST }//, defaultValue: ['jonathan.grimes@nextthought.com'] }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Highlights',
    	model: 'NextThought.model.Highlight'
    }
});