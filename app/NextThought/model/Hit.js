Ext.define('NextThought.model.Hit', {
    extend: 'Ext.data.Model',
    requires: [
    		'NextThought.proxy.Rest',
    		],
    fields: [
       	{ name: 'ContainerId', type: 'string'},
       	{ name: 'Last Modified', type: 'date', dateFormat: 'timestamp' },
        { name: 'Snippet', type: 'string' },
        { name: 'Title', type: 'string' },
        { name: 'Type', type: 'string' }
    ],
    proxy: {
    	type: 'nti',
    	collectionName: 'Hit',
    	model: 'NextThought.model.Hit'
    },
    getModelName: function() {
        return 'Hit';
    }
});