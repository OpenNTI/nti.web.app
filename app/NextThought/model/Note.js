
Ext.define('NextThought.model.Note', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest',
    		'NextThought.model.FriendsList'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
        { name: 'inReplyTo', type: 'string', defaultValue: null },
        { name: 'references', type: 'auto', defaultValue: [] },
        { name: 'Class', type: 'string' },
        { name: 'anchorPoint', type: 'string' },
        { name: 'anchorType', type: 'string', defaultValue: 'previousPreviousName'},
        { name: 'left', type: 'int' },
        { name: 'top', type: 'int' },
        { name: 'text', type: 'string' },
        { name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
       	{ name: 'Creator', type: 'string'},
       	{ name: 'ContainerId', type: 'string'},
       	{ name: 'sharedWith', type: Ext.data.Types.SHARED_WITH }//, defaultValue: ['jonathan.grimes@nextthought.com'] }
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