
Ext.define('NextThought.model.Highlight', {
    extend: 'Ext.data.Model',
    requires: ['NextThought.proxy.NTIRest'],
    fields: [
        { name: 'id', mapping: 'ID', type: 'int' },
        { name: 'startAnchor', type: 'string' },
        { name: 'startOffset', type: 'int' },
       	{ name: 'startHighlightedText', type: 'string' },
     	{ name: 'startHighlightedFullText', type: 'string' },
     	{ name: 'endAnchor', type: 'string' },
       	{ name: 'endOffset', type: 'int' },
       	{ name: 'endHighlightedText', type: 'string' },
       	{ name: 'endHighlightedFullText', type: 'string' },
       	{ name: 'modifiedtime', type: 'string' },
       	{ name: 'ntiid', type: 'string'}
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Highlights'
    }
});