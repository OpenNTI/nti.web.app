Ext.define('NextThought.view.slidedeck.media.viewers.TranscriptViewer', {
    extend: 'Ext.container.Container',
    alias: 'widget.media-transcript-viewer',
    requires: [
        'NextThought.view.slidedeck.Transcript',
        'NextThought.view.video.Video'
    ],

    ui: 'media-viewer',
    viewerType: 'transcript-focus',

    border: false,
    plain: true,
    frame: false,


    statics:{
        getTargetVideoWidth: function(el, transcriptRatio){
            return 512;
        }
    },

    transcriptRatio: 0.55,

    videoWidth: 512,

    cls: 'small-video-player',

    renderTpl: Ext.DomHelper.markup([
        {cls: 'sync-button', cn: [
            {tag: 'span', html: 'sync with video', role: 'button'}
        ]},
        {cls: 'video-player'},
        {id: '{id}-body', cls: 'body', cn: ['{%this.renderContainer(out, values)%}']}
    ]),

    layout: 'auto',
    componentLayout: 'natural',
    childEls: ['body'],
    getTargetEl: function() { return this.body; },


    renderSelectors: {
        headerEl: '.header',
        gridViewEl: '.grid-view-body',
        videoPlayerEl: '.video-player',
        syncEl: '.sync-button'
    },


    initComponent: function(){
        this.callParent(arguments);
        this.buildResourceView();
        this.enableBubble(['jump-video-to']);
    },


    buildResourceView: function(){
        this.resourceView = this.add({
            xtype: 'slidedeck-transcript',
            transcript: this.transcript,
            record: this.record,
            accountForScrollbars: false,
            scrollToId: this.scrollToId,
            videoPlaylist: [this.video],
            xhooks: {
                getScrollTarget: function() { return this.ownerCt.getTargetEl().dom; }
            }
        });

        this.mon(this.resourceView, 'presentation-parts-ready', 'onPresentationPartsReady', this);
        this.mon(this.resourceView, 'no-presentation-parts', 'onPresentationPartsReady', this);
        this.mon(this.resourceView, 'will-show-annotation', 'willShowAnnotation', this);
        this.mon(this.resourceView, 'will-hide-annotation', 'willHideAnnotation', this);
        this.mon(this.resourceView, 'unsync-video', 'unSyncVideo', this);

        if(this.viewerContainer){
            this.resourceView.mon(this.viewerContainer, 'animation-end', 'onAnimationEnd');
        }
    },


    afterRender: function(){
        this.callParent(arguments);
        this.syncVideo();
        this.mon(this.syncEl, 'click', 'syncVideo');

        Ext.defer(this.configureVideoPlayer, 300, this);
    },


    beforeDeactivate: function(){
        var shouldDeactivate = true;
        if(this.resourceView && this.resourceView.beforeDeactivate){
            shouldDeactivate = this.resourceView.beforeDeactivate();
            if(shouldDeactivate === false){
                return false;
            }
        }

        if (this.videoplayer.isPlaying()) {
            this.videoplayer.pausePlayback();
            this.didPauseVideoPlayer = true;
        }

        return true;
    },


    configureVideoPlayer: function(){
        var width = this.self.getTargetVideoWidth(this.getEl(), this.transcriptRatio),
            startTimeSeconds = (this.startAtMillis || 0) / 1000,
            range, pointer;

        this.videoplayer = Ext.widget('content-video-navigation', {
            playlist: [this.video],
            renderTo: this.videoPlayerEl,
            playerWidth: width,
            width: width,
            floatParent: this,
            nextVideo: this.nextVideo,
            prevVideo: this.prevVideo
        });

        this.on('destroy', 'destroy', this.videoplayer);

        if (isFeature('transcript-follow-video')) {
            this.mon(this.videoplayer, 'media-heart-beat', 'actOnMediaHeartBeat', this);
        }

        this.mon(this.videoplayer, {
            scope: this,
            'next-navigation-selected': 'videoNavigation',
            'prev-navigation-selected': 'videoNavigation'
        });

        if (this.record) {
            range = this.record.get('applicableRange') || {};
            pointer = range.start || {};

            startTimeSeconds = pointer.seconds / 1000; //They are actually millis not seconds
        }
        if (startTimeSeconds > 0) {
            this.videoplayer.setVideoAndPosition(this.videoplayer.currentVideoId, startTimeSeconds);
        }

        this.on('jump-video-to', Ext.bind(this.videoplayer.jumpToVideoLocation, this.videoplayer), this);
    },


    adjustOnResize: function(availableHeight, availableWidth){
        var videoWidth = this.videoPlayerEl.getWidth(),
            targetEl = this.getTargetEl(),
            transcriptWidth = Math.floor(availableWidth * this.transcriptRatio),
            tEl = this.el.down('.content-video-transcript');

        targetEl.setStyle('height', availableHeight + 'px');
        if (tEl) {
            if (transcriptWidth > 80) {
                transcriptWidth -= 80;
                tEl.parent('.transcript-view').show();
                tEl.setStyle('width', transcriptWidth + 'px');
            }else {
                tEl.parent('.transcript-view').hide();
            }
            videoWidth += 80;
            this.getTargetEl().setStyle('marginLeft', videoWidth + 'px');
        }
        console.log('Media viewer resizing');
    },


    onPresentationPartsReady: function(){
        this.fireEvent('media-viewer-ready', this);
    },


    willShowAnnotation: function(annotationView) {
        if(!this.resourceView){ return;}

        var nWidth = annotationView.getWidth(),
            tBox = this.resourceView.getBox(),
            vWidth = Ext.dom.Element.getViewportWidth(),
            aWidth = vWidth - tBox.left - tBox.width,
            vl = aWidth - nWidth;

        if (vl < 0) {
            this.videoPlayerEl.setStyle('left', vl + 'px');
            this.getTargetEl().setStyle('left', vl + 'px');
        }
    },


    willHideAnnotation: function(annotationView) {
        this.videoPlayerEl.setStyle('left', '10px');
        this.getTargetEl().setStyle('left', '0px');
    },


    unSyncVideo: function(){
        var transcript = this.resourceView;
        this.syncWithTranscript = false;

        if (this.syncEl && this.resourceView) {
            this.syncEl.setLeft(this.resourceView.getX());
            this.syncEl.setWidth(this.resourceView.getWidth());
            this.syncEl.show();
        }
    },


    actOnMediaHeartBeat: function() {
        var state = this.videoplayer.queryPlayer(),
            time = state && state.time;

        if (!Ext.isEmpty(time) && this.resourceView && this.resourceView.highlightAtTime) {
            //The heartbeat happens every second, so if the range for a line to be highlighted
            //doesn't start on an exact second there is a delay with highlighting the next line.
            //Adding half a second to the time, cuts down on the delay.
            this.resourceView.highlightAtTime(time + 0.5, this.syncWithTranscript);
        }
    },


    syncVideo: function() {
        this.syncWithTranscript = true;

        if (this.syncEl) {
            this.syncEl.hide();
        }
    },


    getLocationInfo: function() {
        var ntiid = this.video && this.video.get('NTIID'),
            lineage = ntiid && ContentUtils.getLineage(ntiid);

        return lineage && lineage.last() && ContentUtils.getLocation(lineage.last());
    },


    videoNavigation: function(video) {
        if (!video) {
            return;
        }

        var li = this.getLocationInfo(),
            ntiid = video && video.get('NTIID');

        if (!li || !video.raw || !ntiid) {
            console.log('Dont know how to handle the navigation');
            return;
        }

        Ext.defer(this.fireEvent, 1, this, ['change-media-in-player', video.raw, ntiid, getURL(li.root)]);
    },


    beforeExitViewer: function(){
        var annotation = this.down('annotation-view');

        if (this.resourceView && !this.resourceView.fireEvent('beforedestroy')) {
            return false;
        }

        return true;
    },


    beforeGridViewerShow: function(){
        if(this.resourceView && this.resourceView.beforeDeactivate){
            this.resourceView.beforeDeactivate();
        }

        if (this.videoplayer.isPlaying()) {
            this.videoplayer.pausePlayback();
            this.didPauseVideoPlayer = true;
        }
    },


    afterGridViewerHide: function(){
        if (this.didPauseVideoPlayer) {
            this.videoplayer.resumePlayback();
            delete this.didPauseVideoPlayer;
        }
    }

});