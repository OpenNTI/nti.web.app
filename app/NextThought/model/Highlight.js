
Ext.define('NextThought.model.Highlight', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.NTIRest'],
    idProperty: 'OID',
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'startXpath', type: 'string' },
        { name: 'startOffset', type: 'int' },
     	{ name: 'endXpath', type: 'string' },
       	{ name: 'endOffset', type: 'int' },
       	{ name: 'color', type: 'string', defaultValue: 'yellow' },
       	{ name: 'modifiedtime', type: 'string' },
       	{ name: 'ntiid', type: 'string'}
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Highlights',
    	model: 'NextThought.model.Highlight'
    }
});