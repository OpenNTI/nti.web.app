Ext.define('NextThought.app.slidedeck.transcript.parts.NoTranscript', {
    extend: 'NextThought.app.slidedeck.transcript.parts.VideoTitle',
    alias: 'widget.no-video-transcript',

    cls: 'no-transcript',

    flex: 1,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    renderTpl: Ext.DomHelper.markup({
        cn: [
            {tag: 'span', cls: 'control-container', cn: {
                cls: 'note-here-control-box add-note-here','data-qtip': 'Add a Note', tag: 'span'
            }}
        ]
    }),


    initComponent: function(){
        this.callParent(arguments);
        this.enableBubble(['presentation-part-ready', 'register-records', 'unregister-records']);
    }
});
