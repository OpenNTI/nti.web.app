
Ext.define('NextThought.model.Highlight', {
    extend: 'NextThought.model.Base',
    requires: [
    		'NextThought.proxy.Rest',
    		'NextThought.model.FriendsList'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
        { name: 'Class', type: 'string' },
        { name: 'startXpath', type: 'string' },
        { name: 'startAnchor', type: 'string' },
        { name: 'startHighlightedFullText', type: 'string' },
        { name: 'startHighlightedText', type: 'string' },
        { name: 'startOffset', type: 'int' },
     	{ name: 'endXpath', type: 'string' },
        { name: 'endAnchor', type: 'string' },
        { name: 'endHighlightedFullText', type: 'string' },
        { name: 'endHighlightedText', type: 'string' },
       	{ name: 'endOffset', type: 'int' },
       	{ name: 'Creator', type: 'string'},
       	{ name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
       	{ name: 'ContainerId', type: 'string'},
        { name: 'text', type: 'string' },
       	{ name: 'sharedWith', type: Ext.data.Types.USER_LIST }//, defaultValue: ['jonathan.grimes@nextthought.com'] }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Highlights',
    	model: 'NextThought.model.Highlight'
    },
    getModelName: function() {
        return 'Highlight';
    }
});
