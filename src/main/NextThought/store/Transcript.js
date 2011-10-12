Ext.define('NextThought.store.Transcript',{
    extend: 'Ext.data.Store',
    requires: [
        'NextThought.model.TranscriptSummary',
        'NextThought.model.Transcript'
    ],

    model: 'NextThought.model.TranscriptSummary',
    autoLoad: false,
    proxy: {
        type: 'rest',
        reader: {
            type: 'json',
            root: 'Items'
        },
        model: 'NextThought.model.TranscriptSummary'
    },

    constructor: function() {
        var h = _AppConfig.server.host,
            d = _AppConfig.server.data,
            u = _AppConfig.server.username;

        this.proxy.url = h+d+'users/'+u+'/Transcripts/';

        this.callParent(arguments);

    },

    /**
     * a utility method to get 
     *
     * @param callback - method to call when we have data to return
     * @param id - the RoomInfo id, see TranscriptSummary or RoomInfo
     */
    getTranscript: function(summary, callbacks) {
        var ri = summary.get('RoomInfo'),
            id = ri ? ri.getId() : null;

        if (!id) Ext.error.raise('Transcript summary does not contain a roominfo with a valid id');

        NextThought.model.Transcript.load(id, callbacks);
    }

});
