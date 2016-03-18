var Ext = require('extjs');
var ModeSmallVideo = require('./SmallVideo');


module.exports = exports = Ext.define('NextThought.app.mediaviewer.components.mode.Split', {
    extend: 'NextThought.app.mediaviewer.components.mode.SmallVideo',
    alias: 'widget.media-split-viewer',

    transcriptRatio: 0.35,

    cls:'',

    viewerType: 'video-focus',

    statics:{

        getTargetVideoWidth: function(el, transcriptRatio){
            var screenHeight = Ext.Element.getViewportHeight(),
                screenWidth = Ext.Element.getViewportWidth(),
                tWidth = Math.floor(screenWidth * transcriptRatio),
                ratio = NextThought.app.video.Video.ASPECT_RATIO,
                chatGutterWidth = 60,
                defaultWidth = Ext.Element.getViewportWidth() - tWidth,
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
    }


});