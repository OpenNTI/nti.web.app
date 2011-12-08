Ext.define('NextThought.model.TranscriptSummary', {
    extend: 'NextThought.model.Base',
    idProperty: 'RoomInfo.OID',
	mimeType: 'application/vnd.nextthought.transcriptsummary',
    fields: [
        { name: 'Class', type: 'string', defaultValue: 'TranscriptSummary'},
        { name: 'RoomInfo', type: 'singleItem'},
        { name: 'NTIID', type: 'string' },
        { name: 'ContainerId', type: 'string' },
        { name: 'Contributors', type: 'auto' },
        { name: 'Last Modified', type: 'date', dateFormat: 'timestamp', defaultValue: new Date() }
    ],
    getModelName: function() {
        return 'TranscriptSummary';
    }
});
