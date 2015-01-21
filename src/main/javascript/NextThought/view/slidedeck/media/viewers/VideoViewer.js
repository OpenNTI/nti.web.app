Ext.define('NextThought.view.slidedeck.media.viewers.VideoViewer',{
    extend: 'NextThought.view.slidedeck.media.viewers.SplitViewer',
    alias: 'widget.media-video-viewer',

    cls: 'full-video-player',

    viewerType: 'full-video',

    transcriptRatio: 0,

    statics:{

        getTargetVideoWidth: function(el, transcriptRatio){
            var screenHeight = Ext.Element.getViewportHeight(),
                screenWidth = Ext.Element.getViewportWidth(),
                paddingRatio = 0.20,
                ratio = NextThought.view.video.Video.ASPECT_RATIO,
                defaultWidth = screenWidth - (screenWidth * paddingRatio),
                defaultHeight = Math.round(defaultWidth * ratio),
                y = 80,
                diff = screenHeight - (y + defaultHeight),
                newWidth;


            if (diff >= 0) {
                return defaultWidth;
            }

            newWidth = Math.round((1 - (Math.abs(diff) / screenHeight)) * defaultWidth);

            return Math.max(newWidth, 512);
        }
    },


    buildResourceView: function(){},


    adjustOnResize: function(availableHeight, availableWidth){
        var videoWidth = this.videoPlayerEl.getWidth(), mLeft = 0;

        this.getTargetEl().setStyle('height', availableHeight + 'px');
        mLeft = Math.floor((availableWidth - videoWidth) /2);
        this.videoPlayerEl.setStyle('marginLeft', mLeft + 'px');
        console.log('Media viewer resizing');
    }
});