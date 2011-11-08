
Ext.define('NextThought.model.Note', {
    extend: 'NextThought.model.Base',
    requires: [
    		'NextThought.proxy.Rest'
    		],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'OID', type: 'string' },
        { name: 'inReplyTo', type: 'string' },
        { name: 'references', type: 'auto', defaultValue: [] },
        { name: 'Class', type: 'string' },
        { name: 'anchorPoint', type: 'string' },
        { name: 'anchorType', type: 'string', defaultValue: 'previousPreviousName'},
        { name: 'left', type: 'int' },
        { name: 'top', type: 'int' },
		{ name: 'body', type: 'auto' },
        { name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
       	{ name: 'Creator', type: 'string'},
       	{ name: 'ContainerId', type: 'string'},
       	{ name: 'sharedWith', type: 'UserList' }
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
