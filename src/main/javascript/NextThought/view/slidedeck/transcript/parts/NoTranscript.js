Ext.define('NextThought.view.slidedeck.transcript.parts.NoTranscript', {
    extend: 'NextThought.view.slidedeck.transcript.parts.VideoTitle',
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
