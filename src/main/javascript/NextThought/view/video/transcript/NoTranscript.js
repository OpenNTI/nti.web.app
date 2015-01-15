Ext.define('NextThought.view.video.transcript.NoTranscript', {
    extend: 'Ext.Component',
    alias: 'widget.no-video-transcript',

    cls: 'content-video-transcript no-transcript',

    renderTpl: Ext.DomHelper.markup([
        {cls:'text-content', html:'{text}'}
    ]),

    renderSelectors: {
        contentEl: '.text-content'
    },


    beforeRender: function(){
        this.callParent(arguments);

        this.renderData = Ext.apply(this.renderData || {}, {
            'text': getString('NextThought.view.video.transcript.NoTranscript')
        });
    }

});
