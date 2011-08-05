
Ext.define('NextThought.model.Note', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.NTIRest'],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'xpath', type: 'string' },
        { name: 'text', type: 'string' },
        { name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'modifiedtime', type: 'string' },
       	{ name: 'ntiid', type: 'string'}
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Notes',
    	model: 'NextThought.model.Note'
    }
});
