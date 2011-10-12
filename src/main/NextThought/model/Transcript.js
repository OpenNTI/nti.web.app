Ext.define('NextThought.model.Transcript', {
    extend: 'NextThought.model.Base',
    requires: [
        'NextThought.proxy.Rest'
    ],
    //idProperty: 'OID',
    fields: [
        { name: 'Class', type: 'string', defaultValue: 'Transcript'},
        { name: 'RoomInfo', type: 'singleItem' },
        { name: 'Messages', type: 'arrayItem' },
        { name: 'NTIID', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'Contributors', type: 'auto' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() }
    ],
    proxy: {
        type: 'nti',
        collectionName: 'Transcripts'
    },
    getModelName: function() {
        return 'Transcript';
    }
});
