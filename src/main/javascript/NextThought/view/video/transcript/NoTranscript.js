Ext.define('NextThought.view.video.transcript.NoTranscript', {
    extend: 'NextThought.view.slidedeck.transcript.VideoTitle',
    alias: 'widget.no-video-transcript',

    cls: 'no-transcript',

    renderTpl: Ext.DomHelper.markup([
        {cls:'text-content', html:'{text}'}
    ]),

    renderSelectors: {
        contentEl: '.text-content'
    },


    beforeRender: function(){
        this.callParent(arguments);

        this.renderData = Ext.apply(this.renderData || {}, {
            'text': 'Temp'
        });
    }

});
