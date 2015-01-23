Ext.define('NextThought.view.video.transcript.NoTranscript', {
    extend: 'NextThought.view.slidedeck.transcript.VideoTitle',
    alias: 'widget.no-video-transcript',

    cls: 'no-transcript',

    renderTpl: Ext.DomHelper.markup({
        cn: [
            {tag: 'span', cls: 'control-container', cn: {
                cls: 'note-here-control-box add-note-here','data-qtip': 'Add a Note', tag: 'span'
            }}
        ]
    })
});
